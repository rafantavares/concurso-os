import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import { StudyRoomTabs } from '@/components/domain/StudyRoomTabs';
import { Question } from '@/components/domain/QuestionPlayer';
import Link from 'next/link';
import { ArrowLeft, Target, ShieldCheck } from 'lucide-react';

export default async function StudyNowPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile?.hours_per_week) redirect('/onboarding');

  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) redirect('/dashboard');
  const primaryExamId = userExams[0].exam_id;

  const aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExamId);
  const plan = generateAdaptiveSchedule({ availableHours: profile.hours_per_week, topics: aggregatedTopics });
  
  const topPriority = plan.length > 0 ? plan[0] : null;

  let adaptiveRec = null;
  let topicQuestions: Question[] = [];

  if (topPriority) {
    const topicPerf = aggregatedTopics.find(t => t.topicId === topPriority.topicId);
    if (topicPerf) {
      const { getAdaptiveRecommendation } = await import('@/services/adaptive-learning/adaptiveService');
      adaptiveRec = await getAdaptiveRecommendation(user.id, topPriority.topicId, topPriority.spi, topicPerf);
    }

    // Fetch interactive questions for this prioritized topic
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topPriority.topicId);

    if (questions && questions.length > 0) {
      topicQuestions = questions as Question[];
    } else {
      // Fallback: fetch general questions for this exam so user is never empty-handed
      const { data: generalQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', primaryExamId)
        .limit(10);
      topicQuestions = (generalQuestions as Question[]) || [];
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
            Ambiente de Aprendizagem
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Sala de Estudo Ativo
          </h1>
        </div>

        <Link 
          href="/dashboard" 
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {!topPriority ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tudo em dia!</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Não há intervenções pendentes no momento. Você pode realizar uma bateria livre de questões.
          </p>
          <Link 
            href="/questions/solve" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>Praticar Questões Gerais</span>
          </Link>
        </div>
      ) : (
        <StudyRoomTabs
          recommendation={topPriority}
          questions={topicQuestions}
          examId={primaryExamId}
          adaptiveRec={adaptiveRec}
        />
      )}
    </div>
  );
}
