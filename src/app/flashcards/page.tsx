import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Layers, 
  Sparkles, 
  Play, 
  Calendar, 
  CheckCircle2, 
  RotateCw, 
  Award, 
  BookOpen,
  ArrowRight,
  Plus
} from 'lucide-react';
import { NewFlashcardModal } from '@/components/flashcards/NewFlashcardModal';
import { DeckSummary, Flashcard } from '@/domain/flashcards/types';

export default async function FlashcardsHubPage() {
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

  // Fetch subjects & topics
  const { data: subjectsData } = await supabase.from('subjects').select('id, name').eq('exam_id', primaryExamId);
  const { data: topicsData } = await supabase.from('topics').select('id, name, subject_id');

  const topicMap = new Map<string, any>((topicsData || []).map((t: any) => [t.id, t]));
  const subjectMap = new Map<string, any>((subjectsData || []).map((s: any) => [s.id, s]));

  // Fetch flashcards
  const { data: cardsData } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const todayStr = new Date().toISOString().split('T')[0];

  const cards: Flashcard[] = (cardsData || []).map((c: any) => {
    const top = topicMap.get(c.topic_id);
    const subj = top ? subjectMap.get(top.subject_id) : null;
    return {
      ...c,
      topic_name: top?.name,
      subject_name: subj?.name,
      subject_id: top?.subject_id,
    };
  });

  // Calculate high-level counters
  const dueTodayCards = cards.filter((c) => c.due_date <= todayStr && c.status !== 'MASTERED');
  const newCards = cards.filter((c) => c.status === 'NEW');
  const learningCards = cards.filter((c) => c.status === 'LEARNING');
  const masteredCards = cards.filter((c) => c.status === 'MASTERED');

  // Group decks by subject
  const deckMap = new Map<string, DeckSummary>();
  for (const s of (subjectsData || [])) {
    deckMap.set(s.id, {
      subjectId: s.id,
      subjectName: s.name,
      totalCards: 0,
      dueToday: 0,
      newCards: 0,
      learningCards: 0,
      masteredCards: 0,
    });
  }

  for (const c of cards) {
    const sId = (c as any).subject_id;
    if (sId && deckMap.has(sId)) {
      const d = deckMap.get(sId)!;
      d.totalCards += 1;
      if (c.due_date <= todayStr && c.status !== 'MASTERED') d.dueToday += 1;
      if (c.status === 'NEW') d.newCards += 1;
      if (c.status === 'LEARNING') d.learningCards += 1;
      if (c.status === 'MASTERED') d.masteredCards += 1;
    }
  }

  const decks = Array.from(deckMap.values()).filter((d) => d.totalCards > 0);

  // Topics list for the modal
  const topicsForModal = (topicsData || []).map((t: any) => {
    const subj = subjectMap.get(t.subject_id);
    return {
      id: t.id,
      name: t.name,
      subjectName: subj?.name,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
              Repetição Espaçada SM-2 • Estilo Anki
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Flashcards Inteligentes
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Fixe regras de ouro, artigos de lei, súmulas e mnemônicos na memória de longo prazo com o algoritmo canônico de repetição espaçada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NewFlashcardModal topics={topicsForModal} />
        </div>
      </div>

      {/* Hero CTA & Quick Counters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main CTA Card (7 cols) */}
        <div className="md:col-span-7 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-7 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Sessão Diária de Memorização</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {dueTodayCards.length > 0 
                ? `Você tem ${dueTodayCards.length} flashcards prontos para revisar hoje!`
                : 'Seus flashcards estão em dia para hoje!'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-md leading-relaxed">
              O segredo da aprovação é a constância diária. Revisar 10 a 15 minutos por dia garante que nenhum artigo de lei escape da sua memória.
            </p>
          </div>

          <div className="pt-6 relative z-10 flex flex-wrap items-center gap-3">
            {dueTodayCards.length > 0 ? (
              <Link
                href="/flashcards/study"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-indigo-950 text-indigo-950" />
                <span>Revisar {dueTodayCards.length} Cards Agora</span>
              </Link>
            ) : (
              <Link
                href="/flashcards/study?all=true"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Revisar Decks em Modo Livre</span>
              </Link>
            )}
          </div>
        </div>

        {/* Counter Stats (5 cols) */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Revisar Hoje
            </span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {dueTodayCards.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Cards vencidos</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Novos Cards
            </span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {newCards.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Ainda não iniciados</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Dominados
            </span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {masteredCards.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Retenção de 21+ dias</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Total Geral
            </span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {cards.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Cards cadastrados</span>
          </div>
        </div>
      </div>

      {/* Decks por Disciplina */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Decks por Disciplina</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {decks.length}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {decks.map((deck) => (
            <div 
              key={deck.subjectId}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/50">
                  {deck.totalCards} cards
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                  {deck.subjectName}
                </h3>
              </div>

              {/* Anki mini counters */}
              <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-1 text-center border border-slate-100">
                <div>
                  <span className="text-xs font-black text-blue-600 block">{deck.newCards}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Novo</span>
                </div>
                <div>
                  <span className="text-xs font-black text-rose-600 block">{deck.dueToday}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Hoje</span>
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-600 block">{deck.masteredCards}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Retido</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/flashcards/study?subjectId=${deck.subjectId}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Praticar Deck</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Flashcards Cadastrados */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Todos os Flashcards Cadastrados</h3>
            <p className="text-xs text-slate-500">Revise o acervo completo e gerencie seus cards.</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{cards.length} cards</span>
        </div>

        <div className="divide-y divide-slate-100">
          {cards.slice(0, 10).map((card) => (
            <div key={card.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                    {card.subject_name || 'Geral'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {card.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    • Próxima revisão: {card.due_date}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 line-clamp-1">{card.front}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{card.back}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  card.status === 'MASTERED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : card.status === 'LEARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {card.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
