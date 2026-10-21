import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { getActivePlan, replanSchedule } from '@/services/adaptive-scheduler/schedulerService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import { TopicPerformanceData, TopicRecommendation, PriorityLevel } from '@/domain/study-intelligence/types';
import { StudyNowCard } from '@/components/domain/StudyNowCard';
import { StudyPlanList } from '@/components/domain/StudyPlanList';
import { RegisterQuestionsForm } from '@/components/forms/RegisterQuestionsForm';
import { RegisterSessionForm } from '@/components/forms/RegisterSessionForm';
import Link from 'next/link';
import { 
  Target, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  TrendingUp,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.hours_per_week) {
    redirect('/onboarding');
  }

  // Fetch Primary Exam
  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id, exams(title, institution, board)')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  const primaryExam = userExams && userExams.length > 0 ? userExams[0] : null;

  if (!primaryExam) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Nenhum Concurso Vinculado</h2>
          <p className="text-sm text-slate-500">
            Você precisa vincular seu concurso ou edital para que o sistema possa gerar seu plano adaptativo.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
          >
            Configurar Concurso
          </Link>
        </div>
      </div>
    );
  }

  let aggregatedTopics: TopicPerformanceData[] = [];
  let plan: TopicRecommendation[] = [];
  let topPriority: TopicRecommendation | undefined = undefined;
  let examTopics: { id: string; name: string }[] = [];

  try {
    aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExam.exam_id);
    examTopics = aggregatedTopics.map(t => ({ id: t.topicId, name: t.topicName }));
    
    // Persistent Adaptive Scheduler 2.0
    const availableMinutes = (profile?.hours_per_week || 10) * 60;
    let activePlan = await getActivePlan(user.id, primaryExam.exam_id);
    if (!activePlan) {
      activePlan = await replanSchedule(user.id, primaryExam.exam_id, availableMinutes, 'INITIAL_PLAN');
    }

    if (activePlan && activePlan.items && activePlan.items.length > 0) {
      plan = activePlan.items.map(item => {
        const topicPerf = aggregatedTopics.find(t => t.topicId === item.topicId);
        return {
          topicId: item.topicId,
          topicName: topicPerf?.topicName || item.topicName || 'Tópico de Estudo',
          recommendedHours: (item.durationMinutes || 60) / 60,
          priorityLevel: (item.priorityLevel || 'LOW') as PriorityLevel,
          spi: topicPerf ? Math.round(topicPerf.recentAccuracy || 50) : 50,
          reasons: [{ 
            type: 'LOW_COVERAGE' as const, 
            value: null, 
            context: `Intervenção: ${item.interventionType}` 
          }],
          isInsufficientData: topicPerf ? topicPerf.questionsAnsweredRecent < 5 : true
        };
      });
    } else {
      plan = generateAdaptiveSchedule({
        availableHours: profile.hours_per_week,
        topics: aggregatedTopics
      });
    }

    topPriority = plan.length > 0 ? plan[0] : undefined;
  } catch (error: any) {
    console.error('Error loading dashboard data:', error);
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Falha ao Sincronizar Plano</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {error.message || 'Não foi possível carregar os dados de planejamento no momento.'}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <span>Tentar Novamente</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Summary stats
  const totalQuestions = aggregatedTopics.reduce((acc, t) => acc + t.questionsAnsweredRecent, 0);
  const totalHours = aggregatedTopics.reduce((acc, t) => acc + t.hoursStudied, 0);
  const examsRaw: any = primaryExam.exams;
  const examTitle = Array.isArray(examsRaw) ? examsRaw[0]?.title : examsRaw?.title;
  const examBoard = Array.isArray(examsRaw) ? examsRaw[0]?.board : examsRaw?.board;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Painel Principal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              {examBoard ? `Banca ${examBoard}` : 'Concurso Ativo'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {examTitle || 'Concurso em Foco'}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-xs transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver Analytics</span>
          </Link>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Feedback</span>
          </Link>
        </div>
      </header>

      {/* Metric Cards Bento */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Estatísticas Principais">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Horas Dedicadas</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Tempo acumulado em sessões de estudo
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Questões (7 dias)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
              {totalQuestions}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Volume recente de evidências</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Meta Semanal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 font-mono tracking-tight">
              {profile.hours_per_week}h <span className="text-sm font-sans text-slate-400 font-normal">/ sem</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Capacidade cadastrada no onboarding
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Motor Adaptativo</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ativo & Calibrando</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Priorização por curva de esquecimento (SPI)
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Left 2/3 Content, Right 1/3 Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Study Now Hero Card */}
          <StudyNowCard recommendation={topPriority} />

          {/* Quick Study Actions */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Ações Rápidas de Estudo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Escolha como deseja praticar hoje diretamente na plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link
                href="/questions/solve"
                className="group p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Resolver Bateria Rápida
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">
                    Pratique questões com gabarito imediato e suporte didático da IA.
                  </p>
                </div>
              </Link>

              <Link
                href="/mistakes"
                className="group p-4 rounded-xl border border-slate-200/80 hover:border-rose-300 bg-white hover:bg-rose-50/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 group-hover:bg-rose-600 text-rose-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      Caderno de Erros
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">
                    Ataque seus pontos fracos identificados pelos registros anteriores.
                  </p>
                </div>
              </Link>

              <Link
                href="/reviews"
                className="group p-4 rounded-xl border border-slate-200/80 hover:border-amber-300 bg-white hover:bg-amber-50/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Revisões Espaçadas
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">
                    Revise os temas que estão prestes a cair no esquecimento.
                  </p>
                </div>
              </Link>

              <Link
                href="/questions"
                className="group p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 bg-white hover:bg-purple-50/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Biblioteca do Concurso
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1">
                    Explore e filtre todas as questões catalogadas do seu edital.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Optional Manual/Offline Recording Accordion */}
          <details className="bg-white rounded-2xl border border-slate-200/80 p-5 transition-all group shadow-xs">
            <summary className="font-bold text-slate-700 cursor-pointer text-xs sm:text-sm flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Estudou por livro físico ou material externo? Clique para registrar</span>
              </span>
              <span className="text-xs text-indigo-600 font-semibold group-open:hidden">Expandir</span>
            </summary>
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-6">
              <RegisterQuestionsForm topics={examTopics} />
              <RegisterSessionForm topics={examTopics} />
            </div>
          </details>
        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <StudyPlanList plan={plan} totalHours={profile.hours_per_week} />
        </div>
      </section>
    </div>
  );
}
