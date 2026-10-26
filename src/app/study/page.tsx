import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import { StudyRoomTabs } from '@/components/domain/StudyRoomTabs';
import { Question } from '@/components/domain/QuestionPlayer';
import Link from 'next/link';
import { ArrowLeft, Target, ShieldCheck } from 'lucide-react';

interface StudyPageProps {
  searchParams: Promise<{ topicId?: string; tab?: 'practice' | 'theory' | 'ai' | 'manual' }>;
}

export default async function StudyNowPage({ searchParams }: StudyPageProps) {
  const { topicId: requestedTopicId, tab: requestedTab } = await searchParams;
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

  // Fetch subjects & topics for navigation
  const { data: subjectsData } = await supabase.from('subjects').select('id, name').eq('exam_id', primaryExamId);
  const { data: topicsData } = await supabase.from('topics').select('id, name, subject_id');
  const subjectMap = new Map<string, any>((subjectsData || []).map((s: any) => [s.id, s]));

  const allTopics = (topicsData || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    subjectName: subjectMap.get(t.subject_id)?.name || '',
  }));

  const aggregatedTopics = await getAggregatedPerformanceData(user.id, primaryExamId);
  const plan = generateAdaptiveSchedule({ availableHours: profile.hours_per_week, topics: aggregatedTopics });
  
  // Decide which topic to display
  let selectedTopic = null;
  if (requestedTopicId) {
    selectedTopic = plan.find((p) => p.topicId === requestedTopicId);
    if (!selectedTopic) {
      const foundTopic = (topicsData || []).find((t: any) => t.id === requestedTopicId);
      if (foundTopic) {
        selectedTopic = {
          topicId: foundTopic.id,
          topicName: foundTopic.name,
          priorityLevel: 'LOW' as const,
          recommendedHours: 1.0,
          spi: 50,
          reasons: [
            {
              type: 'HIGH_EXAM_RELEVANCE' as const,
              value: 1,
              context: 'Tópico selecionado para estudo na sala.',
            },
          ],
          isInsufficientData: false,
        };
      }
    }
  }

  if (!selectedTopic) {
    selectedTopic = plan.length > 0 ? plan[0] : null;
  }

  let adaptiveRec = null;
  let topicQuestions: Question[] = [];
  let initialNote = '';

  if (selectedTopic) {
    const topicPerf = aggregatedTopics.find((t) => t.topicId === selectedTopic.topicId);
    if (topicPerf) {
      const { getAdaptiveRecommendation } = await import('@/services/adaptive-learning/adaptiveService');
      adaptiveRec = await getAdaptiveRecommendation(user.id, selectedTopic.topicId, selectedTopic.spi, topicPerf);
    }

    // Fetch interactive questions for this prioritized topic
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', selectedTopic.topicId);

    if (questions && questions.length > 0) {
      topicQuestions = questions as Question[];
    } else {
      // Fallback: fetch general questions for this exam
      const { data: generalQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', primaryExamId)
        .limit(10);
      topicQuestions = (generalQuestions as Question[]) || [];
    }

    // Fetch user note for this topic
    try {
      const { data: noteRecord } = await supabase
        .from('topic_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('topic_id', selectedTopic.topicId)
        .single();
      if (noteRecord?.content) {
        initialNote = noteRecord.content;
      }
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
            Ambiente de Aprendizagem & Teoria
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

      {!selectedTopic ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tudo em dia!</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Não há intervenções pendentes no momento. Você pode realizar uma bateria livre de questões ou estudar a teoria.
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
          recommendation={selectedTopic}
          questions={topicQuestions}
          examId={primaryExamId}
          adaptiveRec={adaptiveRec}
          initialNote={initialNote}
          allTopics={allTopics}
          initialTab={requestedTab || 'theory'}
        />
      )}
    </div>
  );
}
