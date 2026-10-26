'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveTopicNoteAction(topicId: string, content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const noteId = `note-${user.id}-${topicId}`;
    const now = new Date().toISOString();

    const { error } = await supabase.from('topic_notes').upsert({
      id: noteId,
      user_id: user.id,
      topic_id: topicId,
      content,
      updated_at: now,
    });

    if (error) {
      console.error('[TheoryAction] Erro ao salvar nota:', error);
      return { success: false, error: 'Falha ao salvar anotação.' };
    }

    revalidatePath('/study');
    return { success: true };
  } catch (err: any) {
    console.error('[TheoryAction] Erro inesperado ao salvar nota:', err);
    return { success: false, error: err?.message || 'Erro inesperado.' };
  }
}

export async function getTopicNoteAction(topicId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, content: '' };
    }

    const { data, error } = await supabase
      .from('topic_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('topic_id', topicId)
      .single();

    if (error || !data) {
      return { success: true, content: '' };
    }

    return { success: true, content: data.content || '' };
  } catch (err) {
    return { success: true, content: '' };
  }
}

export async function addTheoryFlashcardAction(
  topicId: string,
  front: string,
  back: string,
  category: string = 'TEORIA'
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const { data: userExams } = await supabase
      .from('user_exams')
      .select('exam_id')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .limit(1);

    const examId = userExams?.[0]?.exam_id || 'exam-local-cnu';
    const cardId = `fc-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('flashcards').insert({
      id: cardId,
      user_id: user.id,
      exam_id: examId,
      topic_id: topicId,
      front,
      back,
      category,
      repetition_count: 0,
      interval_days: 0,
      ease_factor: 2.5,
      due_date: todayStr,
      status: 'NEW',
    });

    if (error) {
      console.error('[TheoryAction] Erro ao criar flashcard da teoria:', error);
      return { success: false, error: 'Não foi possível adicionar o flashcard.' };
    }

    revalidatePath('/flashcards');
    revalidatePath('/study');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado.' };
  }
}
