'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Layers, 
  HelpCircle,
  BookOpen,
  Volume2
} from 'lucide-react';
import { Flashcard } from '@/domain/flashcards/types';
import { reviewCardAction } from '@/app/actions/flashcards';
import { ReviewRating } from '@/domain/flashcards/sm2';

interface FlashcardPlayerProps {
  initialCards: Flashcard[];
}

export function FlashcardPlayer({ initialCards }: FlashcardPlayerProps) {
  const [cardsQueue, setCardsQueue] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const currentCard = cardsQueue[currentIndex];
  const totalInSession = initialCards.length;

  // Keyboard controls: Space to flip, 1/2/3/4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted || isPending) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('AGAIN');
        if (e.key === '2') handleRate('HARD');
        if (e.key === '3') handleRate('GOOD');
        if (e.key === '4') handleRate('EASY');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionCompleted, isPending, currentIndex, cardsQueue]);

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard || isPending) return;

    // Track session counters
    setStats((prev) => ({
      ...prev,
      [rating.toLowerCase()]: prev[rating.toLowerCase() as keyof typeof prev] + 1,
    }));

    startTransition(async () => {
      await reviewCardAction(currentCard.id, rating);

      // If user failed (AGAIN), push the card to the end of the active queue to review again today!
      if (rating === 'AGAIN') {
        setCardsQueue((prev) => [...prev, currentCard]);
      }

      if (currentIndex < cardsQueue.length - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    });
  };

  if (sessionCompleted || !currentCard) {
    const totalReviewed = stats.again + stats.hard + stats.good + stats.easy;
    const retentionRate = totalReviewed > 0 ? Math.round(((stats.good + stats.easy) / totalReviewed) * 100) : 0;

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Revisão Espaçada Concluída
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Excelente trabalho!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Você revisou todos os cards programados para hoje. O algoritmo já calculou os intervalos de retenção para a próxima sessão.
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-base sm:text-lg font-black text-rose-600 block">{stats.again}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">De Novo</span>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-amber-600 block">{stats.hard}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Difícil</span>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-blue-600 block">{stats.good}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Bom</span>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-emerald-600 block">{stats.easy}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Fácil</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Voltar para Decks</span>
          </Link>
        </div>
      </div>
    );
  }

  const remaining = cardsQueue.length - currentIndex;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header with progress */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair da Sessão</span>
        </Link>

        {/* Progress pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            Card {currentIndex + 1} de {cardsQueue.length}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
            {remaining} restantes
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[360px] sm:min-h-[420px] rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer p-8 sm:p-12 flex flex-col justify-between relative group select-none"
      >
        {/* Card Header Meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {currentCard.subject_name && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                {currentCard.subject_name}
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
              {currentCard.topic_name || 'Conceito Fundamental'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {currentCard.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clique ou Espaço p/ virar</span>
          </div>
        </div>

        {/* Central Card Text (Front or Back) */}
        <div className="my-auto py-6 text-center space-y-4">
          {!isFlipped ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Frente • Pergunta
              </span>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed whitespace-pre-line max-w-xl mx-auto">
                {currentCard.front}
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                Verso • Resposta
              </span>
              <p className="text-base sm:text-xl font-medium text-slate-800 leading-relaxed whitespace-pre-line max-w-xl mx-auto text-left sm:text-center">
                {currentCard.back}
              </p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="text-center pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium">
            {!isFlipped ? 'Toque no card para ver o verso' : 'Como foi sua lembrança deste conceito?'}
          </span>
        </div>
      </div>

      {/* Bottom Anki SM-2 Action Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => handleRate('AGAIN')}
            disabled={isPending}
            className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-bold transition-all text-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <div className="text-sm font-black flex items-center justify-center gap-1.5 text-rose-700">
              <span>[1] Errei</span>
            </div>
            <div className="text-[10px] text-rose-600/80 font-semibold mt-0.5">Volta Hoje</div>
          </button>

          <button
            onClick={() => handleRate('HARD')}
            disabled={isPending}
            className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold transition-all text-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <div className="text-sm font-black flex items-center justify-center gap-1.5 text-amber-700">
              <span>[2] Difícil</span>
            </div>
            <div className="text-[10px] text-amber-600/80 font-semibold mt-0.5">1 a 2 dias</div>
          </button>

          <button
            onClick={() => handleRate('GOOD')}
            disabled={isPending}
            className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold transition-all text-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <div className="text-sm font-black flex items-center justify-center gap-1.5 text-blue-700">
              <span>[3] Bom</span>
            </div>
            <div className="text-[10px] text-blue-600/80 font-semibold mt-0.5">3 a 5 dias</div>
          </button>

          <button
            onClick={() => handleRate('EASY')}
            disabled={isPending}
            className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold transition-all text-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <div className="text-sm font-black flex items-center justify-center gap-1.5 text-emerald-700">
              <span>[4] Fácil</span>
            </div>
            <div className="text-[10px] text-emerald-600/80 font-semibold mt-0.5">7+ dias</div>
          </button>
        </div>
      ) : (
        <div className="text-center pt-2">
          <button
            onClick={() => setIsFlipped(true)}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
          >
            Mostrar Resposta [Espaço]
          </button>
        </div>
      )}
    </div>
  );
}
