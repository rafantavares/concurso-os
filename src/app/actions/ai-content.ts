'use server';

import { createClient } from '@/lib/supabase/server';
import { generateQuestionsForWeakness } from '@/domain/ai-content/generator';
import { QuestionBlueprint } from '@/domain/ai-content/types';
import { QuestionImportSchema } from '@/domain/quest-engine/validation';
import { revalidatePath } from 'next/cache';

export async function requestAdaptiveQuestions(blueprint: QuestionBlueprint, count: number = 3) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Gera as questões pela IA
    const generated = await generateQuestionsForWeakness(blueprint, count);

    // 2. Valida deterministicamente via Zod do Quest Engine antes de persistir
    const validToInsert = [];
    
    for (const q of generated) {
      const payload = {
        exam_id: blueprint.examId,
        subject_id: blueprint.subjectId,
        topic_id: blueprint.topicId,
        statement: q.statement,
        options: q.options,
        correct_option: q.correct_option,
        difficulty: blueprint.difficulty,
        source_type: 'AI_GENERATED',
        origin: `REASON: ${blueprint.reason}`,
        year: new Date().getFullYear(),
      };

      const parsed = QuestionImportSchema.safeParse(payload);
      if (parsed.success) {
        validToInsert.push(parsed.data);
      } else {
        console.warn('AI generated an invalid question, skipping.', parsed.error);
      }
    }

    if (validToInsert.length === 0) {
      return { success: false, error: 'As questões geradas não passaram na validação estrutural.' };
    }

    // 3. Insere no banco
    const { error } = await supabase.from('questions').insert(validToInsert);
    if (error) throw error;

    revalidatePath('/questions');
    revalidatePath('/study');
    
    return { success: true, count: validToInsert.length };
  } catch (err: any) {
    console.error('Error generating adaptive questions:', err);
    return { success: false, error: err.message || 'Erro interno.' };
  }
}
