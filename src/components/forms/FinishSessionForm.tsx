'use client';

import { useActionState, useState, useEffect } from 'react';
import { finishStudySession } from '@/app/actions/study';
import { TopicRecommendation } from '@/domain/study-intelligence/types';
import { Play, CheckCircle2, AlertCircle, Clock, BookOpen, Target, Sparkles, RotateCcw } from 'lucide-react';

export function FinishSessionForm({ recommendation }: { recommendation: TopicRecommendation }) {
  const [state, formAction, isPending] = useActionState(finishStudySession, { status: 'idle' as const, message: '' });
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const plannedMinutes = Math.round(recommendation.recommendedHours * 60);
  const storageKey = `study_session_${recommendation.topicId}`;

  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime) {
      setStarted(true);
      setStartTime(parseInt(savedTime, 10));
    }
  }, [storageKey]);

  useEffect(() => {
    if (state.status === 'success') {
      localStorage.removeItem(storageKey);
    }
  }, [state.status, storageKey]);

  const handleStart = () => {
    const now = Date.now();
    setStarted(true);
    setStartTime(now);
    localStorage.setItem(storageKey, now.toString());
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    setStarted(false);
    setStartTime(null);
  };

  if (!started) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200/80 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/60 mb-2">
            Recomendação Ativa
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{recommendation.topicName}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Tempo sugerido pelo algoritmo: <strong className="text-slate-700 font-semibold">{plannedMinutes} min</strong>
          </p>
        </div>
        <button 
          onClick={handleStart}
          className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl text-base font-semibold shadow-sm hover:shadow-md active:scale-[0.99] transition-all w-full md:w-auto"
        >
          <Play className="w-5 h-5 fill-current" /> Começar Estudo Agora
        </button>
      </div>
    );
  }

  // Pre-fill realized based on elapsed time
  const elapsedMinutes = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
  const suggestedRealized = elapsedMinutes > 0 ? elapsedMinutes : plannedMinutes;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Sessão em Andamento</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">{recommendation.topicName}</h2>
        </div>
        <button
          onClick={handleClear}
          type="button"
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Cancelar timer
        </button>
      </div>
      
      {state.status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Sessão Registrada com Sucesso!</p>
            <p className="text-emerald-700 mt-0.5">{state.message}</p>
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Erro ao registrar sessão</p>
            <p className="text-rose-700 mt-0.5">{state.message}</p>
          </div>
        </div>
      )}

      {state.status !== 'success' && (
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="topicId" value={recommendation.topicId} />
          <input type="hidden" name="planned" value={plannedMinutes} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Modalidade de Estudo
              </label>
              <select 
                name="type" 
                className="select-custom w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer" 
                required 
                defaultValue="THEORY"
              >
                <option value="THEORY">📖 Leitura / Teoria</option>
                <option value="EXERCISES">🎯 Questões / Bateria Prática</option>
                <option value="REVIEW">🔄 Revisão Ativa / Flashcards</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Tempo Realizado (minutos)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="realized" 
                  defaultValue={suggestedRealized} 
                  min="1" 
                  required 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" 
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400 pointer-events-none">minutos</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">Questões Praticadas (Opcional)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Total Respondido</label>
                <input 
                  type="number" 
                  name="totalQ" 
                  min="0" 
                  placeholder="Ex: 20" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Total de Acertos</label>
                <input 
                  type="number" 
                  name="correctQ" 
                  min="0" 
                  placeholder="Ex: 15" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">Percepção de Domínio (Opcional)</h3>
            </div>
            <select 
              name="feeling" 
              className="select-custom w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer"
            >
              <option value="">Selecione como se sentiu com o conteúdo...</option>
              <option value="EASY">🟢 Fácil (Compreendi com facilidade e dominei)</option>
              <option value="NORMAL">🟡 Médio (No caminho certo, fixação padrão)</option>
              <option value="HARD">🔴 Difícil (Assunto denso, preciso de mais reforço)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando e atualizando plano...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Encerrar Sessão e Recalibrar
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
