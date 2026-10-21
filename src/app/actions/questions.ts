'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitQuestionAttempt(
  questionId: string, 
  topicId: string, 
  selectedOption: string, 
  isCorrect: boolean, 
  durationSeconds: number
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('user_attempts').insert({
      user_id: user.id,
      question_id: questionId,
      topic_id: topicId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_spent_seconds: durationSeconds
    });

    if (error) {
      console.error('Error saving attempt:', error);
      return { success: false, error: 'Falha ao registrar tentativa.' };
    }

    // Simultaneously, to keep the old aggregator working smoothly for now, we duplicate to user_answers.
    // In Phase 12, user_answers could be entirely dropped or migrated.
    await supabase.from('user_answers').insert({
      user_id: user.id,
      topic_id: topicId,
      is_correct: isCorrect
    });

    revalidatePath('/questions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Exception in submitQuestionAttempt:', err);
    return { success: false, error: 'Erro interno.' };
  }
}
