'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { SimuladoAnswer, SimuladoMode } from '@/domain/simulados/types';

export async function createSimuladoAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  // Fetch primary exam
  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  const examId = userExams?.[0]?.exam_id || 'exam-local-cnu';

  const mode = (formData.get('mode') as SimuladoMode) || 'GENERAL';
  const subjectId = (formData.get('subjectId') as string) || null;
  const totalQuestionsReq = parseInt((formData.get('totalQuestions') as string) || '15', 10);
  const timeLimitParam = formData.get('timeLimitMinutes') as string;
  const timeLimitMinutes = timeLimitParam && timeLimitParam !== 'null' ? parseInt(timeLimitParam, 10) : null;
  
  let customTitle = (formData.get('title') as string)?.trim();
  if (!customTitle) {
    if (mode === 'MISTAKES') {
      customTitle = 'Simulado de Recuperação (Caderno de Erros)';
    } else if (mode === 'SUBJECT') {
      customTitle = 'Simulado Temático por Disciplina';
    } else {
      customTitle = `Simulado Geral #${new Date().toLocaleDateString('pt-BR')}`;
    }
  }

  // Fetch pool of candidate questions
  let selectedQuestionIds: string[] = [];

  if (mode === 'MISTAKES') {
    // 1. Get questions the user previously erred on
    const { data: wrongAttempts } = await supabase
      .from('user_attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_correct', false);

    const wrongIds = Array.from(new Set((wrongAttempts || []).map((a: any) => a.question_id).filter(Boolean)));
    
    if (wrongIds.length > 0) {
      // Pick questions that exist in current questions pool
      const { data: pool } = await supabase
        .from('questions')
        .select('id')
        .in('id', wrongIds);

      selectedQuestionIds = (pool || []).map((q: any) => q.id);
    }
  } else if (mode === 'SUBJECT' && subjectId) {
    const { data: pool } = await supabase
      .from('questions')
      .select('id')
      .eq('subject_id', subjectId);

    selectedQuestionIds = (pool || []).map((q: any) => q.id);
  }

  // If not enough questions or in GENERAL mode, fetch all exam questions
  if (selectedQuestionIds.length < totalQuestionsReq) {
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('id, subject_id')
      .eq('exam_id', examId);

    if (allQuestions && allQuestions.length > 0) {
      const existingSet = new Set(selectedQuestionIds);
      // Shuffle candidates randomly
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      for (const q of shuffled) {
        if (!existingSet.has(q.id)) {
          selectedQuestionIds.push(q.id);
          existingSet.add(q.id);
        }
        if (selectedQuestionIds.length >= totalQuestionsReq) break;
      }
    }
  }

  // Shuffle final question selection
  selectedQuestionIds = selectedQuestionIds.sort(() => 0.5 - Math.random()).slice(0, totalQuestionsReq);

  if (selectedQuestionIds.length === 0) {
    throw new Error('Nenhuma questão encontrada para compor o simulado.');
  }

  const simuladoId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Default initial empty answers
  const initialPayload: Record<string, SimuladoAnswer> = {};
  for (const qId of selectedQuestionIds) {
    initialPayload[qId] = {
      questionId: qId,
      selectedOption: null,
      isCorrect: null,
      isMarkedForReview: false,
      eliminatedOptions: [],
      timeSpentSeconds: 0,
    };
  }

  const { error } = await supabase.from('simulados').insert({
    id: simuladoId,
    user_id: user.id,
    exam_id: examId,
    title: customTitle,
    mode: mode,
    subject_filter: subjectId,
    total_questions: selectedQuestionIds.length,
    correct_answers: 0,
    wrong_answers: 0,
    unanswered: selectedQuestionIds.length,
    time_limit_minutes: timeLimitMinutes,
    time_spent_seconds: 0,
    score_percentage: 0,
    status: 'IN_PROGRESS',
    question_ids: selectedQuestionIds,
    answers_payload: initialPayload,
  });

  if (error) {
    console.error('Erro ao criar simulado:', error);
    throw new Error(`Falha ao registrar simulado: ${error.message}`);
  }

  revalidatePath('/simulados');
  redirect(`/simulados/${simuladoId}`);
}

export async function saveSimuladoProgressAction(
  simuladoId: string,
  answers: Record<string, SimuladoAnswer>,
  timeSpentSeconds: number
) {
  try {
    const supabase = await createClient();
    await supabase
      .from('simulados')
      .update({
        answers_payload: answers,
        time_spent_seconds: timeSpentSeconds,
      })
      .eq('id', simuladoId);

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar progresso do simulado:', err);
    return { success: false, error: err?.message };
  }
}

export async function finishSimuladoAction(
  simuladoId: string,
  answers: Record<string, SimuladoAnswer>,
  totalTimeSpentSeconds: number
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado.');

    // 1. Fetch simulado to get question_ids
    const { data: simulado, error: simError } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', simuladoId)
      .single();

    if (simError || !simulado) {
      throw new Error('Simulado não encontrado.');
    }

    const questionIds: string[] = Array.isArray(simulado.question_ids) 
      ? simulado.question_ids 
      : JSON.parse(simulado.question_ids || '[]');

    // 2. Fetch all questions to compare answers with correct_option
    const { data: questions } = await supabase
      .from('questions')
      .select('id, topic_id, correct_option')
      .in('id', questionIds);

    const questionsMap = new Map<string, any>((questions || []).map((q: any) => [q.id, q]));

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const evaluatedPayload: Record<string, SimuladoAnswer> = {};
    const attemptsToInsert: any[] = [];
    const answersToInsert: any[] = [];

    for (const qId of questionIds) {
      const q = questionsMap.get(qId);
      const userAns = answers[qId];
      const selected = userAns?.selectedOption || null;

      let isCorrect: boolean | null = null;

      if (!selected) {
        unansweredCount++;
      } else if (q && selected === q.correct_option) {
        correctCount++;
        isCorrect = true;
      } else {
        wrongCount++;
        isCorrect = false;
      }

      evaluatedPayload[qId] = {
        questionId: qId,
        selectedOption: selected,
        isCorrect: isCorrect,
        isMarkedForReview: !!userAns?.isMarkedForReview,
        eliminatedOptions: userAns?.eliminatedOptions || [],
        timeSpentSeconds: userAns?.timeSpentSeconds || 0,
      };

      // Feed attempts only for questions that were actually answered
      if (selected && q) {
        attemptsToInsert.push({
          user_id: user.id,
          question_id: qId,
          topic_id: q.topic_id,
          selected_option: selected,
          is_correct: isCorrect === true,
          time_spent_seconds: userAns?.timeSpentSeconds || 0,
        });

        answersToInsert.push({
          user_id: user.id,
          topic_id: q.topic_id,
          is_correct: isCorrect === true ? 1 : 0,
        });
      }
    }

    const totalQuestions = questionIds.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 3. Update simulado in database
    await supabase
      .from('simulados')
      .update({
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered: unansweredCount,
        score_percentage: scorePercentage,
        time_spent_seconds: totalTimeSpentSeconds,
        answers_payload: evaluatedPayload,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
      .eq('id', simuladoId);

    // 4. Batch insert attempts to update real analytics and Caderno de Erros
    if (attemptsToInsert.length > 0) {
      await supabase.from('user_attempts').insert(attemptsToInsert);
    }
    if (answersToInsert.length > 0) {
      await supabase.from('user_answers').insert(answersToInsert);
    }

    revalidatePath('/simulados');
    revalidatePath(`/simulados/${simuladoId}`);
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    revalidatePath('/mistakes');

    return {
      success: true,
      redirectUrl: `/simulados/${simuladoId}/resultado`,
    };
  } catch (err: any) {
    console.error('Erro ao finalizar simulado:', err);
    return { success: false, error: err?.message || 'Falha ao encerrar simulado.' };
  }
}
