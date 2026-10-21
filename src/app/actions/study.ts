'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function registerQuestionBatch(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { status: 'error', message: 'Usuário não autenticado.' };
    }

    const topicId = formData.get('topicId') as string;
    const total = parseInt(formData.get('total') as string, 10);
    const correct = parseInt(formData.get('correct') as string, 10);

    if (!topicId) return { status: 'error', message: 'Assunto não selecionado.' };
    if (isNaN(total) || total <= 0) return { status: 'error', message: 'Total de questões inválido.' };
    if (isNaN(correct) || correct < 0 || correct > total) return { status: 'error', message: 'Quantidade de acertos inválida.' };

    // Atomicity: Generate an array of individual answers to insert in a single request
    const answersToInsert = [];
    for (let i = 0; i < total; i++) {
      answersToInsert.push({
        user_id: user.id,
        topic_id: topicId,
        is_correct: i < correct // the first N are correct, the rest are false
      });
    }

    // Insert all in a single transaction (Supabase insert with array is atomic)
    const { error } = await supabase.from('user_attempts').insert(answersToInsert);

    if (error) {
      console.error('Error inserting answers:', error);
      return { status: 'error', message: 'Falha ao registrar questões no banco de dados.' };
    }

    revalidatePath('/dashboard');
    return { status: 'success', message: `${total} questões registradas com sucesso. Seu desempenho foi recalculado.` };
  } catch (err) {
    console.error('Exception in registerQuestionBatch:', err);
    return { status: 'error', message: 'Erro interno ao processar a requisição.' };
  }
}

export async function registerStudySession(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { status: 'error', message: 'Usuário não autenticado.' };
    }

    const topicId = formData.get('topicId') as string;
    const duration = parseInt(formData.get('duration') as string, 10);
    const type = formData.get('type') as string;

    if (!topicId) return { status: 'error', message: 'Assunto não selecionado.' };
    if (isNaN(duration) || duration <= 0) return { status: 'error', message: 'Duração inválida.' };
    if (!['THEORY', 'REVIEW', 'EXERCISES', 'SIMULATED'].includes(type)) return { status: 'error', message: 'Tipo de sessão inválido.' };

    const { error } = await supabase.from('study_sessions').insert({
      user_id: user.id,
      topic_id: topicId,
      duration_minutes: duration,
      session_type: type
    });

    if (error) {
      console.error('Error inserting session:', error);
      return { status: 'error', message: 'Falha ao registrar sessão no banco de dados.' };
    }

    revalidatePath('/dashboard');
    return { status: 'success', message: `Sessão de ${duration} minutos registrada com sucesso.` };
  } catch (err) {
    console.error('Exception in registerStudySession:', err);
    return { status: 'error', message: 'Erro interno ao processar a requisição.' };
  }
}

export async function finishStudySession(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 'error', message: 'Usuário não autenticado.' };

    const topicId = formData.get('topicId') as string;
    const type = formData.get('type') as string;
    const planned = parseInt(formData.get('planned') as string, 10);
    const realized = parseInt(formData.get('realized') as string, 10);
    const totalQ = parseInt(formData.get('totalQ') as string, 10);
    const correctQ = parseInt(formData.get('correctQ') as string, 10);
    const feeling = formData.get('feeling') as string || null;

    if (!topicId || isNaN(realized) || realized <= 0) {
      return { status: 'error', message: 'Dados de tempo inválidos.' };
    }

    const validPlanned = isNaN(planned) ? null : planned;
    const validTotalQ = isNaN(totalQ) ? 0 : Math.max(0, totalQ);
    const validCorrectQ = isNaN(correctQ) ? 0 : Math.max(0, Math.min(correctQ, validTotalQ)); // Garante correct <= total

    if (validTotalQ > 500) {
      return { status: 'error', message: 'Muitas questões para uma única bateria. Reduza a quantidade.' };
    }

    // Atomic Insertion via Postgres RPC
    const { error: rpcError } = await supabase.rpc('register_study_session_with_answers', {
      p_user_id: user.id,
      p_topic_id: topicId,
      p_duration: realized,
      p_planned: validPlanned,
      p_type: type,
      p_feeling: feeling,
      p_total_q: validTotalQ,
      p_correct_q: validCorrectQ
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return { status: 'error', message: 'Falha ao registrar a sessão atômica no banco de dados.' };
    }

    revalidatePath('/', 'layout');
    return { status: 'success', message: 'Sessão concluída! Seu planejamento foi recalculado.' };
  } catch (err) {
    console.error('Exception in finishStudySession:', err);
    return { status: 'error', message: 'Erro interno.' };
  }
}
