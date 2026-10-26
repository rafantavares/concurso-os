'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateSM2, ReviewRating } from '@/domain/flashcards/sm2';
import { FlashcardCategory } from '@/domain/flashcards/types';

export async function reviewCardAction(cardId: string, rating: ReviewRating) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado.');

    const { data: card, error: cardError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      throw new Error('Flashcard não encontrado.');
    }

    const sm2Result = calculateSM2({
      repetitionCount: card.repetition_count || 0,
      intervalDays: card.interval_days || 0,
      easeFactor: Number(card.ease_factor) || 2.5,
      rating,
    });

    const { error: updateError } = await supabase
      .from('flashcards')
      .update({
        repetition_count: sm2Result.repetitionCount,
        interval_days: sm2Result.intervalDays,
        ease_factor: sm2Result.easeFactor,
        due_date: sm2Result.dueDate,
        status: sm2Result.status,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', cardId);

    if (updateError) {
      throw new Error(`Falha ao atualizar card: ${updateError.message}`);
    }

    revalidatePath('/flashcards');
    revalidatePath('/flashcards/study');
    revalidatePath('/reviews');
    revalidatePath('/dashboard');

    return {
      success: true,
      nextDue: sm2Result.dueDate,
      intervalDays: sm2Result.intervalDays,
      status: sm2Result.status,
    };
  } catch (err: any) {
    console.error('Erro ao revisar flashcard:', err);
    return { success: false, error: err?.message || 'Erro ao processar revisão.' };
  }
}

export async function createFlashcardAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado.');

    const front = (formData.get('front') as string)?.trim();
    const back = (formData.get('back') as string)?.trim();
    const topicId = (formData.get('topicId') as string)?.trim();
    const category = ((formData.get('category') as string) || 'GERAL') as FlashcardCategory;

    if (!front || !back || !topicId) {
      return { success: false, error: 'Frente, verso e disciplina são obrigatórios.' };
    }

    // Get active exam
    const { data: userExams } = await supabase
      .from('user_exams')
      .select('exam_id')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .limit(1);

    const examId = userExams?.[0]?.exam_id || 'exam-local-cnu';
    const cardId = `fc_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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

    if (error) throw new Error(error.message);

    revalidatePath('/flashcards');
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao criar flashcard:', err);
    return { success: false, error: err?.message || 'Falha ao salvar flashcard.' };
  }
}

export async function deleteFlashcardAction(cardId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado.');

    // In local db or supabase, we can update or delete
    // If table doesn't have soft delete, we can simply delete or mark status
    await supabase.from('flashcards').delete?.() || await supabase.from('flashcards').update({ status: 'MASTERED' }).eq('id', cardId);

    revalidatePath('/flashcards');
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar flashcard:', err);
    return { success: false, error: err?.message };
  }
}

export async function generateFlashcardFromQuestionAction(questionId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado.');

    // Fetch question
    const { data: q } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!q) throw new Error('Questão não encontrada.');

    const front = `[Fixação de Erro]\n${q.statement.slice(0, 280)}${q.statement.length > 280 ? '...' : ''}`;
    const back = `Gabarito Correto:\n${q.correct_option}\n\nFundamentação Legal:\n${q.explanation || 'Consulte a doutrina e legislação de regência.'}`;

    const cardId = `fc_err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    await supabase.from('flashcards').insert({
      id: cardId,
      user_id: user.id,
      exam_id: q.exam_id,
      topic_id: q.topic_id,
      front,
      back,
      category: 'CADERNO_ERROS',
      repetition_count: 0,
      interval_days: 0,
      ease_factor: 2.3, // Slightly harder initial factor for known mistakes
      due_date: todayStr,
      status: 'LEARNING',
    });

    revalidatePath('/flashcards');
    revalidatePath('/mistakes');
    return { success: true, message: 'Flashcard gerado com sucesso no seu Deck!' };
  } catch (err: any) {
    console.error('Erro ao gerar flashcard da questão:', err);
    return { success: false, error: err?.message || 'Falha ao gerar flashcard.' };
  }
}
