'use server';

import { createClient } from '@/lib/supabase/server';
import { QuestionImportSchema, QuestionFilters } from '@/domain/quest-engine/validation';
import { revalidatePath } from 'next/cache';

export async function createQuestion(formData: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Validação estrita
    const parsed = QuestionImportSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.from('questions').insert(parsed.data);
    if (error) throw error;

    revalidatePath('/questions');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating question:', err);
    return { success: false, error: err.message || 'Erro interno.' };
  }
}

export async function importQuestionsBatch(questions: any[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const validQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      const parsed = QuestionImportSchema.safeParse(questions[i]);
      if (parsed.success) {
        validQuestions.push(parsed.data);
      } else {
        errors.push(`Questão ${i + 1}: ${parsed.error.issues[0].message}`);
      }
    }

    if (validQuestions.length > 0) {
      const { error } = await supabase.from('questions').insert(validQuestions);
      if (error) throw error;
    }

    revalidatePath('/questions');
    return { 
      success: true, 
      importedCount: validQuestions.length, 
      errors 
    };
  } catch (err: any) {
    console.error('Error importing batch:', err);
    return { success: false, error: 'Falha grave na importação em lote.' };
  }
}

export async function fetchQuestionsList(filters: QuestionFilters) {
  const supabase = await createClient();
  
  let query = supabase
    .from('questions')
    .select('id, statement, difficulty, source_type, created_at, topic_id, topics(name)', { count: 'exact' });

  if (filters.examId) query = query.eq('exam_id', filters.examId);
  if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
  if (filters.topicId) query = query.eq('topic_id', filters.topicId);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.sourceType) query = query.eq('source_type', filters.sourceType);
  if (filters.query) query = query.ilike('statement', `%${filters.query}%`);

  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;

  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    return { data: [], count: 0 };
  }

  return { data, count };
}
