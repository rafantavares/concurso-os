import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FlashcardPlayer } from '@/components/flashcards/FlashcardPlayer';
import { Flashcard } from '@/domain/flashcards/types';
import { Layers, ArrowLeft, RotateCw, CheckCircle2 } from 'lucide-react';

interface StudyPageProps {
  searchParams: Promise<{ subjectId?: string; all?: string }>;
}

export default async function FlashcardStudyPage({ searchParams }: StudyPageProps) {
  const { subjectId, all } = await searchParams;
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

  // Fetch topics and subjects for labels
  const { data: topicsData } = await supabase.from('topics').select('id, name, subject_id');
  const { data: subjectsData } = await supabase.from('subjects').select('id, name');

  const topicMap = new Map<string, any>((topicsData || []).map((t: any) => [t.id, t]));
  const subjectMap = new Map<string, any>((subjectsData || []).map((s: any) => [s.id, s]));

  // Fetch cards
  const { data: rawCards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id);

  const todayStr = new Date().toISOString().split('T')[0];

  let candidateCards: Flashcard[] = (rawCards || []).map((c: any) => {
    const top = topicMap.get(c.topic_id);
    const subj = top ? subjectMap.get(top.subject_id) : null;
    return {
      ...c,
      topic_name: top?.name,
      subject_name: subj?.name,
      subject_id: top?.subject_id,
    };
  });

  // Filter by subject if specified
  if (subjectId) {
    candidateCards = candidateCards.filter((c: any) => c.subject_id === subjectId);
  }

  // Filter by due date if not in free practice mode (`all=true`)
  let sessionCards: Flashcard[] = [];
  if (all === 'true') {
    sessionCards = candidateCards;
  } else {
    // Due cards or new cards
    sessionCards = candidateCards.filter((c) => c.due_date <= todayStr || c.status === 'NEW');
  }

  // Shuffle session cards
  sessionCards = [...sessionCards].sort(() => 0.5 - Math.random());

  if (sessionCards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Tudo em dia para hoje!</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Você não possui nenhum flashcard pendente de revisão para a data de hoje nesta seleção.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href={`/flashcards/study?all=true${subjectId ? `&subjectId=${subjectId}` : ''}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Estudar em Modo Livre ({candidateCards.length} cards)</span>
          </Link>
          <Link
            href="/flashcards"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Decks</span>
          </Link>
        </div>
      </div>
    );
  }

  return <FlashcardPlayer initialCards={sessionCards} />;
}
