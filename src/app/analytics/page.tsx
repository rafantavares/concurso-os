import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCandidateAnalytics } from '@/services/candidate-analytics/analyticsService';
import Link from 'next/link';
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  Sparkles,
  Minus
} from 'lucide-react';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Nenhum Concurso Vinculado</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Você precisa vincular seu concurso ou edital para visualizar os relatórios e métricas de desempenho.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <span>Configurar Concurso</span>
          </Link>
        </div>
      </div>
    );
  }

  const examId = userExams[0].exam_id;
  const summary = await getCandidateAnalytics(user.id, examId);

  const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
    'CALIBRANDO': { label: 'Calibrando Dados', badge: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    'CONSTRUINDO_BASE': { label: 'Construindo Base', badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    'EVOLUINDO': { label: 'Evoluindo em Ritmo Forte', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'CONSOLIDANDO': { label: 'Consolidando Conteúdo', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
    'ATENCAO': { label: 'Atenção Necessária', badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
  };

  const currentStatus = statusConfig[summary.status] || statusConfig['CALIBRANDO'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Diagnóstico Longitudinal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">Janela de 30 dias</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Analytics da Preparação
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatus.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`} />
            <span>{currentStatus.label}</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Global Summary Bento */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Métricas de Desempenho Geral">
        {/* Desempenho Geral */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Aproveitamento</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
            {summary.globalAccuracy !== null ? `${Math.round(summary.globalAccuracy)}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500">Média ponderada oficial vs simulada</p>
        </div>

        {/* Aderência ao Plano */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Aderência ao Plano</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
            {summary.adherencePercentage !== null ? `${Math.round(summary.adherencePercentage)}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500">Cumprimento dos blocos planejados</p>
        </div>

        {/* Horas Realizadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Horas Realizadas</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
            {summary.hoursRealized.toFixed(1)}h
          </div>
          <p className="text-[11px] text-slate-500">Tempo líquido em 30 dias</p>
        </div>

        {/* Questões Recentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Questões Resolvidas</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
            {summary.questionsAnswered}
          </div>
          <p className="text-[11px] text-slate-500">Total de evidências computadas</p>
        </div>
      </section>

      {/* Insights Automáticos */}
      {summary.insights.length > 0 && (
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Insights do Sistema de Inteligência
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.insights.map((insight, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-start gap-3"
              >
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 flex-shrink-0 mt-0.5">
                  {insight.type}
                </span>
                <span className="text-xs text-slate-700 leading-relaxed">{insight.context}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Subjects Progress Table */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Evolução por Disciplina</h2>
            <p className="text-xs text-slate-500 mt-0.5">Acompanhamento de taxa de acerto e tendências na janela ativa.</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {summary.subjects.length} disciplinas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Disciplina</th>
                <th className="py-3 px-4">Aproveitamento</th>
                <th className="py-3 px-4">Tendência (30d)</th>
                <th className="py-3 px-4">Horas Dedicadas</th>
                <th className="py-3 px-4 text-right">Questões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {summary.subjects.map(s => (
                <tr key={s.subjectId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.subjectName}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {s.accuracy !== null ? `${Math.round(s.accuracy)}%` : '--'}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.trend === 'IMPROVING' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{s.trendValue?.toFixed(1)}%</span>
                      </span>
                    )}
                    {s.trend === 'DECLINING' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span>{s.trendValue?.toFixed(1)}%</span>
                      </span>
                    )}
                    {s.trend === 'STABLE' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Minus className="w-3 h-3" />
                        <span>Estável</span>
                      </span>
                    )}
                    {s.trend === 'INSUFFICIENT_DATA' && (
                      <span className="text-[11px] text-slate-400 italic">Pouca evidência</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{s.hoursStudied.toFixed(1)}h</td>
                  <td className="py-3.5 px-4 font-mono text-right">{s.questionsAnswered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strategies Return */}
      {summary.strategyEffectiveness.length > 0 && (
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Retorno Observado por Estratégia de Estudo
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {summary.strategyEffectiveness.map(strat => (
              <div 
                key={strat.interventionType} 
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {strat.interventionType}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {strat.sampleSize} sessões observadas
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-600">Impacto médio:</span>
                  {strat.averageObservedImprovement > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      +{strat.averageObservedImprovement.toFixed(1)} pontos
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      {strat.averageObservedImprovement.toFixed(1)} pontos
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
