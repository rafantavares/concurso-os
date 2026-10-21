'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

import { extractTextFromPdfBuffer } from '@/services/edital/pdfExtractor';
import { structureContent } from '@/services/edital/contentStructurer';

export async function uploadAndProcessEdital(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { status: 'error', message: 'Usuário não autenticado.' };

    const examId = formData.get('examId') as string;
    const file = formData.get('file') as File;

    if (!examId || !file) {
      return { status: 'error', message: 'Dados inválidos. Envie um arquivo e o ID do concurso.' };
    }

    if (file.type !== 'application/pdf') {
      return { status: 'error', message: 'O arquivo precisa ser um PDF.' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { status: 'error', message: 'O arquivo não pode exceder 10MB.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Storage
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('editais')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    if (uploadError) {
      console.error('Storage error:', uploadError);
      return { status: 'error', message: 'Erro ao fazer upload do arquivo.' };
    }

    // 2. Create Document Record
    const { data: docData, error: docError } = await supabase.from('exam_documents').insert({
      exam_id: examId,
      user_id: user.id,
      file_path: filePath,
      original_name: file.name,
      size_bytes: file.size,
      status: 'PROCESSING'
    }).select('id').single();

    if (docError || !docData) {
      return { status: 'error', message: 'Erro ao registrar documento no banco.' };
    }

    const documentId = docData.id;

    // 3. Extract Text
    const extractionResult = await extractTextFromPdfBuffer(buffer);

    if (extractionResult.classification === 'SCANNED_PDF' || extractionResult.classification === 'UNKNOWN') {
      // Falha gracefully: marca como REVIEW_REQUIRED mas com array vazio ou aviso
      await supabase.from('exam_documents').update({ status: 'REVIEW_REQUIRED' }).eq('id', documentId);
      await supabase.from('exam_document_drafts').insert({
        document_id: documentId,
        user_id: user.id,
        content: { roles: [], warning: 'O PDF parece ser escaneado ou ilegível. Adicione os assuntos manualmente.' }
      });
      revalidatePath(`/edital/${documentId}/review`);
      return { status: 'success', message: 'PDF processado com avisos. Revisão necessária.' };
    }

    // 4. Structure Content
    const draftContent = await structureContent(extractionResult.pages);

    // 5. Save Draft
    const { error: draftError } = await supabase.from('exam_document_drafts').insert({
      document_id: documentId,
      user_id: user.id,
      content: draftContent
    });

    if (draftError) {
      console.error('Draft error:', draftError);
      await supabase.from('exam_documents').update({ status: 'FAILED' }).eq('id', documentId);
      return { status: 'error', message: 'Erro ao salvar o rascunho.' };
    }

    // 6. Update Status
    await supabase.from('exam_documents').update({ status: 'REVIEW_REQUIRED' }).eq('id', documentId);
    
    // Sucesso, o frontend pode redirecionar para a rota de revisão
    // revalidatePath('/dashboard');
    return { status: 'success', message: `success:${documentId}` }; // Hack to pass ID to client
  } catch (err) {
    console.error('Processing error:', err);
    return { status: 'error', message: 'Erro interno ao processar o edital.' };
  }
}

/**
 * Confirms the draft and persists subjects and topics to the official tables.
 */
export async function confirmEditalExtraction(documentId: string, examId: string, finalContent: any): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { status: 'error', message: 'Usuário não autenticado.' };

    // Using bulk insert for subjects and topics isn't easily done in a single JS flat array because
    // topics need the subject_id generated after subject insertion. 
    // Ideally this would be an RPC function inside Postgres for transaction safety.
    // For MVP, we'll iterate. 

    const rolesToInsert = finalContent.roles || [];

    for (const role of rolesToInsert) {
      // In a more complex DB schema, we'd insert a "Role" (Cargo) first.
      // For this slice, we assume exams are already bound to roles or we just insert the subjects for this exam.
      const subjectsToInsert = role.subjects || [];

      for (const sub of subjectsToInsert) {
        const { data: subjectData, error: subErr } = await supabase
          .from('subjects')
          .insert({
            exam_id: examId,
            name: sub.name,
            weight: sub.weight || 1
          })
          .select('id')
          .single();

        if (subErr || !subjectData) {
          console.error('Error inserting subject:', subErr);
          continue;
        }

        const topicsToInsert = (sub.topics || []).map((t: any) => ({
          subject_id: subjectData.id,
          name: t.name,
          estimated_hours_to_cover: t.estimatedHours,
          estimated_hours_source: t.hoursSource || 'NONE'
        }));

        if (topicsToInsert.length > 0) {
          const { error: topicErr } = await supabase.from('topics').insert(topicsToInsert);
          if (topicErr) console.error('Error inserting topics:', topicErr);
        }
      }
    }

    // Mark as CONFIRMED
    await supabase.from('exam_documents').update({ status: 'CONFIRMED' }).eq('id', documentId);

    revalidatePath('/dashboard');
    return { status: 'success', message: 'Edital oficializado com sucesso.' };
  } catch (err) {
    console.error('Confirmation error:', err);
    return { status: 'error', message: 'Erro interno ao oficializar edital.' };
  }
}
