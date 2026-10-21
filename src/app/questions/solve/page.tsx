import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QuestionPlayer, Question } from '@/components/domain/QuestionPlayer';
import Link from 'next/link';
import { ArrowLeft, Zap, BookOpen, HelpCircle } from 'lucide-react';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) redirect('/dashboard');
  const primaryExamId = userExams[0].exam_id;

  const params = await searchParams;
  const topicId = params?.topicId;

  // Fetch questions for this exam (and optionally for this specific topic)
  let query = supabase
    .from('questions')
    .select('*')
    .eq('exam_id', primaryExamId)
    .limit(15);

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  let { data: questions } = await query;

  // If filtered by topic and no questions found, fallback to any exam questions
  if ((!questions || questions.length === 0) && topicId) {
    const { data: fallback } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', primaryExamId)
      .limit(15);
    questions = fallback;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
            Treino Adaptativo
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Bateria de Questões
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {topicId ? 'Treino direcionado no assunto selecionado' : 'Bateria rápida de alta retenção com questões do seu concurso'}
          </p>
        </div>

        <Link 
          href="/dashboard" 
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Content */}
      {questions && questions.length > 0 ? (
        <QuestionPlayer questions={questions as Question[]} />
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma questão encontrada</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Não localizamos questões disponíveis para este filtro no momento. Acesse a biblioteca para navegar em todo o acervo.
          </p>
          <div className="pt-2">
            <Link 
              href="/questions" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Biblioteca</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
