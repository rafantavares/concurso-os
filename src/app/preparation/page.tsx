import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle2, Layers } from 'lucide-react';

export default async function PreparationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id, exams(title)')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) redirect('/dashboard');
  const primaryExam = userExams[0];
  const examTitle = Array.isArray(primaryExam.exams) ? primaryExam.exams[0]?.title : (primaryExam.exams as any)?.title;

  const aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExam.exam_id);
  const plan = generateAdaptiveSchedule({ availableHours: profile?.hours_per_week || 10, topics: aggregatedTopics });

  // Calculate Global Stats
  const totalQuestions = aggregatedTopics.reduce((acc, t) => acc + t.questionsAnsweredRecent, 0);
  const totalHours = aggregatedTopics.reduce((acc, t) => acc + t.hoursStudied, 0);
  
  // Calculate average accuracy
  let sumAcc = 0;
  let sumQ = 0;
  aggregatedTopics.forEach(t => {
    if (t.questionsAnsweredRecent > 0 && t.recentAccuracy !== null) {
      sumAcc += (t.recentAccuracy / 100) * t.questionsAnsweredRecent;
      sumQ += t.questionsAnsweredRecent;
    }
  });
  const avgAccuracy = sumQ > 0 ? (sumAcc / sumQ) * 100 : 0;

  // Calculate Coverage
  let coveredHours = 0;
  let estimatedTotalHours = 0;
  let isCoverageKnown = false;
  aggregatedTopics.forEach(t => {
    if (t.estimatedHoursToCover) {
      isCoverageKnown = true;
      estimatedTotalHours += t.estimatedHoursToCover;
      coveredHours += Math.min(t.hoursStudied, t.estimatedHoursToCover);
    }
  });
  const coveragePercent = isCoverageKnown && estimatedTotalHours > 0 ? (coveredHours / estimatedTotalHours) * 100 : null;

  const subjectsList = [{
    name: 'Conteúdo Programático',
    maxSpi: Math.max(...plan.map(p => p.spi), 0),
    topics: plan.map(p => {
      const topicData = aggregatedTopics.find(t => t.topicId === p.topicId);
      return {
        ...p,
        name: topicData?.topicName || p.topicId,
        recentAccuracy: topicData?.recentAccuracy,
        hoursStudied: topicData?.hoursStudied || 0,
        estimatedHours: topicData?.estimatedHoursToCover || null
      };
    })
  }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
            Mapeamento de Edital
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Minha Preparação
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {examTitle || 'Concurso em Andamento'}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Global Summary Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cobertura Teórica</span>
          <div 
            className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono truncate"
            title={coveragePercent !== null ? `${coveragePercent.toFixed(1)}%` : 'Em Calibração'}
          >
            {coveragePercent !== null ? `${coveragePercent.toFixed(1)}%` : 'Em Calibração'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Taxa de Acerto</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono truncate">
            {avgAccuracy.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidências</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono truncate">
            {totalQuestions} <span className="text-xs font-sans text-slate-400">questões</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tempo Líquido</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-mono truncate">
            {totalHours.toFixed(1)}h
          </div>
        </div>
      </section>

      {/* Content Topics */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Distribuição do Conteúdo Programático</span>
        </h2>

        {subjectsList.map(sub => (
          <div key={sub.name} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">{sub.name}</h3>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Max SPI: {sub.maxSpi}
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {sub.topics.map((t: any) => {
                const cov = t.estimatedHours ? Math.min(100, (t.hoursStudied / t.estimatedHours) * 100) : null;
                return (
                  <div key={t.topicId} className="p-3.5 hover:bg-slate-50/70 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{t.name}</span>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Aproveitamento: <strong className="text-slate-800">{t.isInsufficientData ? 'Calibrando' : (t.recentAccuracy !== null ? `${t.recentAccuracy.toFixed(0)}%` : 'N/A')}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Tempo estudado: <strong className="text-slate-800 font-mono">{t.hoursStudied.toFixed(1)}h</strong></span>
                      </div>
                    </div>

                    {cov !== null && (
                      <div className="w-24 sm:w-28 hidden md:block shrink-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-medium">
                          <span>Cobertura</span>
                          <span className="font-mono text-slate-600 font-semibold">{cov.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${cov}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        SPI {t.spi}
                      </span>
                      <Link
                        href={`/questions/solve?topicId=${t.topicId}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 transition-colors shadow-2xs"
                      >
                        Praticar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
