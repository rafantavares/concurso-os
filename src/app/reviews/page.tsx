import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, ArrowUpRight, Clock, ShieldCheck, Zap } from 'lucide-react';

export default async function ReviewsPage() {
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

  const aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExamId);
  
  // Filter and sort by daysSinceLastReview (descending)
  const reviewsList = aggregatedTopics
    .filter(t => t.daysSinceLastReview !== null && t.daysSinceLastReview > 0)
    .sort((a, b) => (b.daysSinceLastReview || 0) - (a.daysSinceLastReview || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
            Curva de Ebbinghaus
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Revisões Espaçadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assuntos ordenados pelo tempo decorrido desde o último contato para prevenir o esquecimento.
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        {reviewsList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Revisões em Dia</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhum tópico ultrapassou a janela recomendada de revisão. Seu ciclo de retenção está ativo.
            </p>
            <Link
              href="/questions/solve"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 mt-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Resolver Bateria Livre</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewsList.map((topic, index) => (
              <div 
                key={topic.topicId} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{topic.daysSinceLastReview} {topic.daysSinceLastReview === 1 ? 'dia sem revisar' : 'dias sem revisar'}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {topic.topicName}
                  </h3>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  <Link
                    href={`/questions/solve?topicId=${topic.topicId}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Revisar com Questões</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
