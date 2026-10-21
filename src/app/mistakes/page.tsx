import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';

export default async function MistakesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) redirect('/dashboard');
  const primaryExamId = userExams[0].exam_id;

  const aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExamId);
  const plan = generateAdaptiveSchedule({ availableHours: profile?.hours_per_week || 10, topics: aggregatedTopics });

  // Map errors and SPI
  const mistakesList = aggregatedTopics
    .filter(t => t.recentErrorsCount > 0 || (t.recentAccuracy !== null && t.recentAccuracy < 50 && t.questionsAnsweredRecent > 0))
    .map(t => {
      const priorityInfo = plan.find(p => p.topicId === t.topicId);
      return {
        topicId: t.topicId,
        topicName: t.topicName,
        errors: t.recentErrorsCount,
        spi: priorityInfo?.spi || 0,
        priorityLevel: priorityInfo?.priorityLevel || 'NORMAL'
      };
    })
    .filter(m => m.errors > 0)
    .sort((a, b) => b.spi - a.spi);

  const getPriorityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
            Diagnóstico de Fragilidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Caderno de Erros
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assuntos onde você cometeu deslizes recentes, ordenados pelo impacto no seu resultado (SPI).
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
        {mistakesList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nenhum Erro Crítico Registrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Seus acertos estão consistentes ou você ainda não respondeu questões suficientes. Continue praticando!
            </p>
            <Link
              href="/questions/solve"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 mt-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Resolver Bateria</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mistakesList.map((mistake, index) => (
              <div 
                key={mistake.topicId} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      <span>{mistake.errors} {mistake.errors === 1 ? 'erro recente' : 'erros recentes'}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(mistake.priorityLevel)}`}>
                      SPI {mistake.spi}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {mistake.topicName}
                  </h3>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  <Link
                    href={`/questions/solve?topicId=${mistake.topicId}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Superar Erros</span>
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
