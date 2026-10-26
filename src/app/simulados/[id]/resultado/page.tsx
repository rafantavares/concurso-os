import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { SimuladoResultView } from '@/components/simulados/SimuladoResultView';
import { QuestionWithTopic, SimuladoRecord, SubjectStat } from '@/domain/simulados/types';

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function SimuladoResultadoPage({ params }: ResultPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: simuladoData, error: simError } = await supabase
    .from('simulados')
    .select('*')
    .eq('id', id)
    .single();

  if (simError || !simuladoData) {
    notFound();
  }

  // If still in progress, redirect to runner
  if (simuladoData.status === 'IN_PROGRESS') {
    redirect(`/simulados/${id}`);
  }

  const questionIds: string[] = Array.isArray(simuladoData.question_ids)
    ? simuladoData.question_ids
    : JSON.parse(simuladoData.question_ids || '[]');

  // Fetch Questions
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds);

  const { data: topicsData } = await supabase.from('topics').select('id, name, subject_id');
  const { data: subjectsData } = await supabase.from('subjects').select('id, name');

  const topicMap = new Map<string, any>((topicsData || []).map((t: any) => [t.id, t]));
  const subjectMap = new Map<string, any>((subjectsData || []).map((s: any) => [s.id, s]));
  const rawMap = new Map<string, any>((rawQuestions || []).map((q: any) => [q.id, q]));

  const answersPayload = typeof simuladoData.answers_payload === 'object' && simuladoData.answers_payload !== null
    ? simuladoData.answers_payload
    : JSON.parse(simuladoData.answers_payload || '{}');

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

  // Compute breakdown by subject
  const subjectBreakdown = new Map<string, { total: number; correct: number; name: string }>();

  for (const q of orderedQuestions) {
    const sId = q.subject_id || 'unknown';
    const sName = q.subject_name || 'Geral';
    const isCorrect = answersPayload[q.id]?.isCorrect === true;

    if (!subjectBreakdown.has(sId)) {
      subjectBreakdown.set(sId, { total: 0, correct: 0, name: sName });
    }

    const cur = subjectBreakdown.get(sId)!;
    cur.total += 1;
    if (isCorrect) cur.correct += 1;
  }

  const subjectStats: SubjectStat[] = Array.from(subjectBreakdown.entries()).map(([sId, data]) => ({
    subjectId: sId,
    subjectName: data.name,
    total: data.total,
    correct: data.correct,
    percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  const simulado: SimuladoRecord = {
    ...simuladoData,
    question_ids: questionIds,
    answers_payload: answersPayload,
  };

  return (
    <SimuladoResultView 
      simulado={simulado} 
      questions={orderedQuestions} 
      subjectStats={subjectStats} 
    />
  );
}
