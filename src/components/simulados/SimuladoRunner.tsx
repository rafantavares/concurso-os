'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Timer, 
  Pause, 
  Play, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Slash, 
  Send, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { QuestionWithTopic, SimuladoAnswer, SimuladoRecord } from '@/domain/simulados/types';
import { saveSimuladoProgressAction, finishSimuladoAction } from '@/app/actions/simulados';

interface SimuladoRunnerProps {
  simulado: SimuladoRecord;
  questions: QuestionWithTopic[];
}

export function SimuladoRunner({ simulado, questions }: SimuladoRunnerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // Initialize answers state from database payload or fresh
  const [answers, setAnswers] = useState<Record<string, SimuladoAnswer>>(() => {
    const initial: Record<string, SimuladoAnswer> = {};
    for (const q of questions) {
      const saved = simulado.answers_payload?.[q.id];
      initial[q.id] = {
        questionId: q.id,
        selectedOption: saved?.selectedOption || null,
        isCorrect: saved?.isCorrect ?? null,
        isMarkedForReview: saved?.isMarkedForReview || false,
        eliminatedOptions: saved?.eliminatedOptions || [],
        timeSpentSeconds: saved?.timeSpentSeconds || 0,
      };
    }
    return initial;
  });

  // Timer state
  const hasTimeLimit = simulado.time_limit_minutes !== null && simulado.time_limit_minutes > 0;
  const initialSecondsLeft = hasTimeLimit
    ? Math.max(0, simulado.time_limit_minutes! * 60 - (simulado.time_spent_seconds || 0))
    : 0;

  const [secondsLeft, setSecondsLeft] = useState<number>(initialSecondsLeft);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(simulado.time_spent_seconds || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Track time spent on current question
  const currentQuestionTimeRef = useRef(0);

  // Timer Tick
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
      currentQuestionTimeRef.current += 1;

      if (hasTimeLimit) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoFinish();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, hasTimeLimit]);

  // Periodic Auto-save every 20 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isPaused) {
        saveSimuladoProgressAction(simulado.id, answers, totalTimeSpent);
      }
    }, 20000);

    return () => clearInterval(autoSaveInterval);
  }, [simulado.id, answers, totalTimeSpent, isPaused]);

  // Save current question time when navigating away
  const flushCurrentQuestionTime = () => {
    if (!currentQuestion) return;
    const addedTime = currentQuestionTimeRef.current;
    if (addedTime > 0) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          timeSpentSeconds: (prev[currentQuestion.id]?.timeSpentSeconds || 0) + addedTime,
        },
      }));
      currentQuestionTimeRef.current = 0;
    }
  };

  const handleNext = () => {
    flushCurrentQuestionTime();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    flushCurrentQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    flushCurrentQuestionTime();
    setCurrentIndex(index);
  };

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || isPaused) return;

    setAnswers((prev) => {
      const currentAns = prev[currentQuestion.id];
      const isAlreadySelected = currentAns?.selectedOption === option;

      // Also remove from eliminated if selecting it
      const newEliminated = (currentAns?.eliminatedOptions || []).filter((o) => o !== option);

      return {
        ...prev,
        [currentQuestion.id]: {
          ...currentAns,
          selectedOption: isAlreadySelected ? null : option,
          eliminatedOptions: newEliminated,
        },
      };
    });
  };

  const handleToggleEliminateOption = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    if (!currentQuestion || isPaused) return;

    setAnswers((prev) => {
      const currentAns = prev[currentQuestion.id];
      const isEliminated = currentAns?.eliminatedOptions?.includes(option);
      const newEliminated = isEliminated
        ? (currentAns?.eliminatedOptions || []).filter((o) => o !== option)
        : [...(currentAns?.eliminatedOptions || []), option];

      // If eliminated option was currently selected, unselect it
      const newSelected = currentAns?.selectedOption === option ? null : currentAns?.selectedOption;

      return {
        ...prev,
        [currentQuestion.id]: {
          ...currentAns,
          selectedOption: newSelected,
          eliminatedOptions: newEliminated,
        },
      };
    });
  };

  const handleToggleFlagReview = () => {
    if (!currentQuestion || isPaused) return;

    setAnswers((prev) => {
      const currentAns = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...currentAns,
          isMarkedForReview: !currentAns?.isMarkedForReview,
        },
      };
    });
  };

  const handleAutoFinish = () => {
    flushCurrentQuestionTime();
    startTransition(async () => {
      const res = await finishSimuladoAction(simulado.id, answers, totalTimeSpent);
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    });
  };

  const handleConfirmFinish = () => {
    flushCurrentQuestionTime();
    setShowFinishModal(false);
    startTransition(async () => {
      const res = await finishSimuladoAction(simulado.id, answers, totalTimeSpent);
      if (res.success && res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    });
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Summary counts for navigation pill
  const answeredCount = Object.values(answers).filter((a) => !!a.selectedOption).length;
  const flaggedCount = Object.values(answers).filter((a) => a.isMarkedForReview).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Visual urgency for countdown
  const isUrgentTime = hasTimeLimit && secondsLeft <= 120; // Last 2 mins
  const isWarningTime = hasTimeLimit && secondsLeft <= 600 && !isUrgentTime; // Last 10 mins

  const currentAns = currentQuestion ? answers[currentQuestion.id] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Fixed Control Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Exam info & Breadcrumb */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline">
              Simulado Oficial
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-1">
                {simulado.title}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Questão {currentIndex + 1} de {totalQuestions} • {answeredCount} respondidas
              </p>
            </div>
          </div>

          {/* Central Timer */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-all ${
              isUrgentTime
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse ring-2 ring-rose-400/20'
                : isWarningTime
                ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/10'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              <Timer className={`w-4 h-4 ${isUrgentTime ? 'text-rose-600' : isWarningTime ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>
                {hasTimeLimit ? formatTimer(secondsLeft) : formatTimer(totalTimeSpent)}
              </span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isPaused
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isPaused ? 'Retomar Simulado' : 'Pausar Simulado'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isPaused ? 'Retomar' : 'Pausar'}</span>
            </button>
          </div>

          {/* Finish Action */}
          <div>
            <button
              onClick={() => setShowFinishModal(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-indigo-300" />
              <span>Finalizar Prova</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Left / Center: Question Solver (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* Paused Blur Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white animate-in fade-in duration-150">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <Pause className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black">Simulado Pausado</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  O cronômetro está parado e o enunciado foi ocultado para garantir a fidedignidade da sua pontuação.
                </p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Retomar Prova</span>
                </button>
              </div>
            )}

            {currentQuestion ? (
              <div className="space-y-6">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Questão {currentIndex + 1}
                    </span>
                    {currentQuestion.subject_name && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                        {currentQuestion.subject_name}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      {currentQuestion.topic_name || 'Tópico Geral'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      currentQuestion.difficulty === 'HARD'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : currentQuestion.difficulty === 'EASY'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  {/* Flag toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFlagReview}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      currentAns?.isMarkedForReview
                        ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${currentAns?.isMarkedForReview ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{currentAns?.isMarkedForReview ? 'Marcada p/ Revisar' : 'Marcar p/ Revisar'}</span>
                  </button>
                </div>

                {/* Statement */}
                <div className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal selection:bg-indigo-100 selection:text-indigo-900 whitespace-pre-line">
                  {currentQuestion.statement}
                </div>

                {/* Alternatives List */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Alternativas de Resposta</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Dica: use o ícone 🚫 para riscar opções descartadas
                    </span>
                  </div>

                  {currentQuestion.options.map((optionText, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex);
                    const isSelected = currentAns?.selectedOption === optionText;
                    const isEliminated = currentAns?.eliminatedOptions?.includes(optionText);

                    return (
                      <div
                        key={optIndex}
                        onClick={() => handleSelectOption(optionText)}
                        className={`group relative flex items-start gap-3.5 p-4 rounded-xl border text-sm sm:text-base transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/15 text-slate-900 shadow-xs'
                            : isEliminated
                            ? 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-50'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Letter Badge */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isEliminated
                            ? 'bg-slate-200 text-slate-500'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {letter}
                        </div>

                        {/* Option Text */}
                        <div className={`flex-1 pt-0.5 leading-relaxed ${isEliminated ? 'line-through text-slate-400' : ''}`}>
                          {optionText}
                        </div>

                        {/* Strike-through Discard Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleEliminateOption(e, optionText)}
                          className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer ${
                            isEliminated
                              ? 'opacity-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isEliminated ? 'Restaurar alternativa' : 'Eliminar alternativa (descartar)'}
                        >
                          <Slash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Nenhuma questão carregada.</div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-xs text-slate-400 hidden sm:block">
                Atalhos: use as setas para navegar
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFinishModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Revisar & Finalizar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cartão-Resposta Navegável (4 cols on lg) */}
        <aside className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-20">
            {/* Title & Stats */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Cartão-Resposta</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {Math.round((answeredCount / totalQuestions) * 100)}% preenchido
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2 text-emerald-800">
                <span className="block text-base font-black text-emerald-700">{answeredCount}</span>
                <span className="text-[10px] text-emerald-600/80">Respondidas</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 text-amber-800">
                <span className="block text-base font-black text-amber-700">{flaggedCount}</span>
                <span className="text-[10px] text-amber-600/80">Para Revisar</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700">
                <span className="block text-base font-black text-slate-800">{unansweredCount}</span>
                <span className="text-[10px] text-slate-500">Em Branco</span>
              </div>
            </div>

            {/* Grid of Question Numbers */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Navegação Rápida
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {questions.map((q, qIdx) => {
                  const ans = answers[q.id];
                  const isCurrent = qIdx === currentIndex;
                  const isAnswered = !!ans?.selectedOption;
                  const isFlagged = ans?.isMarkedForReview;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(qIdx)}
                      className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none ${
                        isCurrent
                          ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white font-black'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isFlagged
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      <span>{qIdx + 1}</span>

                      {/* Small Flag Indicator if flagged */}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] shadow-xs">
                          🚩
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finalize Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFinishModal(true)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Entregar Simulado</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Finalizar Prova?</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Ao entregar, suas respostas serão computadas, seu aproveitamento será gerado e os erros alimentarão seu plano adaptativo.
              </p>
            </div>

            {/* Quick check breakdown */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span>Questões Respondidas:</span>
                <span className="font-bold text-emerald-700">{answeredCount} de {totalQuestions}</span>
              </div>
              {flaggedCount > 0 && (
                <div className="flex items-center justify-between text-amber-700">
                  <span className="flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 fill-amber-500" />
                    Marcadas para revisar:
                  </span>
                  <span className="font-bold">{flaggedCount}</span>
                </div>
              )}
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between text-rose-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Questões em branco:
                  </span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Continuar Prova
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Enviando...' : 'Confirmar & Entregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
