'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function recordFocusSessionAction(params: {
  durationMinutes: number;
  topicId?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const duration = Math.max(1, Math.round(params.durationMinutes));

    const { data: userExams } = await supabase
      .from('user_exams')
      .select('exam_id')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .limit(1);

    const examId = userExams?.[0]?.exam_id || 'exam-local-cnu';
    const topicId = params.topicId || 'top-1';

    const sessionId = `sess-focus-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from('study_sessions').insert({
      id: sessionId,
      user_id: user.id,
      exam_id: examId,
      topic_id: topicId,
      duration_minutes: duration,
      questions_attempted: 0,
      questions_correct: 0,
      session_type: 'THEORY',
    });

    if (error) {
      console.error('[FocusAction] Erro ao registrar foco:', error);
      return { success: false, error: 'Falha ao registrar sessão.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    revalidatePath('/study');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado.' };
  }
}
