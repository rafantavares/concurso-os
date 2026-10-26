import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SimuladoRunner } from '@/components/simulados/SimuladoRunner';
import { QuestionWithTopic, SimuladoRecord } from '@/domain/simulados/types';

interface SimuladoPageProps {
  params: Promise<{ id: string }>;
}

export default async function SimuladoExecutionPage({ params }: SimuladoPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch Simulado
  const { data: simuladoData, error: simError } = await supabase
    .from('simulados')
    .select('*')
    .eq('id', id)
    .single();

  if (simError || !simuladoData) {
    notFound();
  }

  // If already completed, jump to result view
  if (simuladoData.status === 'COMPLETED') {
    redirect(`/simulados/${id}/resultado`);
  }

  const questionIds: string[] = Array.isArray(simuladoData.question_ids)
    ? simuladoData.question_ids
    : JSON.parse(simuladoData.question_ids || '[]');

  // Fetch Questions
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds);

  // Fetch topics and subjects for meta labels
  const { data: topicsData } = await supabase.from('topics').select('id, name, subject_id');
  const { data: subjectsData } = await supabase.from('subjects').select('id, name');

  const topicMap = new Map<string, any>((topicsData || []).map((t: any) => [t.id, t]));
  const subjectMap = new Map<string, any>((subjectsData || []).map((s: any) => [s.id, s]));

  const rawMap = new Map<string, any>((rawQuestions || []).map((q: any) => [q.id, q]));

  // Preserve exact ordering of questions as defined in questionIds
  const orderedQuestions: QuestionWithTopic[] = questionIds
    .map((qId) => {
      const q = rawMap.get(qId);
      if (!q) return null;

      const top = topicMap.get(q.topic_id);
      const subj = q.subject_id 
        ? subjectMap.get(q.subject_id) 
        : (top ? subjectMap.get(top.subject_id) : null);

      const parsedOptions = Array.isArray(q.options) 
        ? q.options 
        : (typeof q.options === 'string' ? JSON.parse(q.options) : []);

      return {
        id: q.id,
        exam_id: q.exam_id,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
        statement: q.statement,
        options: parsedOptions,
        correct_option: q.correct_option,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'MEDIUM',
        source_type: q.source_type || 'OFFICIAL',
        year: q.year || 2026,
        topic_name: top?.name,
        subject_name: subj?.name,
      };
    })
    .filter(Boolean) as QuestionWithTopic[];

  const simulado: SimuladoRecord = {
    ...simuladoData,
    question_ids: questionIds,
    answers_payload: typeof simuladoData.answers_payload === 'object' && simuladoData.answers_payload !== null
      ? simuladoData.answers_payload
      : JSON.parse(simuladoData.answers_payload || '{}'),
  };

  return <SimuladoRunner simulado={simulado} questions={orderedQuestions} />;
}
