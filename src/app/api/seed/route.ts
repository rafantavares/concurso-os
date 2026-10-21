import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { QuestionImportSchema } from '@/domain/quest-engine/validation';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seed only allowed in development' }, { status: 403 });
  }

  // Use service role client to bypass RLS during seed
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Pick or create an exam
  let { data: exams } = await supabase.from('exams').select('id').limit(1);
  if (!exams || exams.length === 0) {
    const { data: newExam } = await supabase.from('exams').insert({
      title: 'Concurso Geral / Teste Inicial',
      institution: 'ConcursoOS',
      board: 'Banca Geral',
      status: 'OPEN'
    }).select('id').single();
    if (newExam) exams = [newExam];
  }

  if (!exams || exams.length === 0) {
    return NextResponse.json({ error: 'No exams found to seed' }, { status: 400 });
  }
  const examId = exams[0].id;

  // 2. Ensure default subjects & topics exist
  let { data: subjects } = await supabase.from('subjects').select('id, name').eq('exam_id', examId);
  if (!subjects || subjects.length === 0) {
    const defaultSubjects = [
      { exam_id: examId, name: 'Direito Constitucional', weight: 1.5 },
      { exam_id: examId, name: 'Direito Administrativo', weight: 1.5 },
      { exam_id: examId, name: 'Língua Portuguesa', weight: 2.0 },
      { exam_id: examId, name: 'Raciocínio Lógico', weight: 1.0 }
    ];
    const { data: insertedSubs } = await supabase.from('subjects').insert(defaultSubjects).select('id, name');
    subjects = insertedSubs || [];
  }

  const subjectMap = new Map((subjects || []).map(s => [s.name, s.id]));

  // Ensure topics
  const subjectIds = (subjects || []).map(s => s.id);
  let { data: topics } = await supabase.from('topics').select('id, subject_id, name').in('subject_id', subjectIds);

  if (!topics || topics.length === 0) {
    const defaultTopics = [
      { subject_id: subjectMap.get('Direito Constitucional'), name: 'Direitos e Deveres Individuais (Art. 5º)' },
      { subject_id: subjectMap.get('Direito Constitucional'), name: 'Organização do Estado e dos Poderes' },
      { subject_id: subjectMap.get('Direito Administrativo'), name: 'Princípios e Atos Administrativos' },
      { subject_id: subjectMap.get('Direito Administrativo'), name: 'Regime Jurídico dos Servidores' },
      { subject_id: subjectMap.get('Língua Portuguesa'), name: 'Interpretação e Compreensão de Texto' },
      { subject_id: subjectMap.get('Língua Portuguesa'), name: 'Concordância e Regência Verbal' },
      { subject_id: subjectMap.get('Raciocínio Lógico'), name: 'Lógica Proposicional e Conectivos' }
    ].filter(t => t.subject_id);

    const { data: insertedTopics } = await supabase.from('topics').insert(defaultTopics).select('id, subject_id, name');
    topics = insertedTopics || [];
  }

  if (!topics || topics.length === 0) {
    return NextResponse.json({ error: 'No topics could be created' }, { status: 400 });
  }

  const generated = [];
  const options = ['A', 'B', 'C', 'D', 'E'];
  const questionsPerTopic = 12;

  for (const topic of topics) {
    for (let i = 0; i < questionsPerTopic; i++) {
      const correctOptIndex = Math.floor(Math.random() * options.length);
      const diffRandom = Math.random();
      const diff = diffRandom > 0.7 ? 'HARD' : (diffRandom > 0.3 ? 'MEDIUM' : 'EASY');
      
      const q = {
        exam_id: examId,
        subject_id: topic.subject_id,
        topic_id: topic.id,
        statement: `[Simulado 2026] Em relação ao assunto "${topic.name}", assinale a alternativa que apresenta a proposição correta de acordo com a legislação e jurisprudência aplicável.`,
        options: options.map((o) => `Alternativa ${o}: Disposição fundamental referente a ${topic.name} (Opção ${o})`),
        correct_option: `Alternativa ${options[correctOptIndex]}: Disposição fundamental referente a ${topic.name} (Opção ${options[correctOptIndex]})`,
        explanation: `Justificativa comentada para a questão ${i + 1} sobre ${topic.name}. A alternativa correta é a letra ${options[correctOptIndex]}.`,
        difficulty: diff,
        source_type: 'OFFICIAL',
        year: 2026
      };
      
      const parsed = QuestionImportSchema.safeParse(q);
      if (parsed.success) {
        generated.push(parsed.data);
      }
    }
  }

  // Insert generated questions
  const { error } = await supabase.from('questions').insert(generated);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, seededQuestions: generated.length, topicsCount: topics.length });
}
