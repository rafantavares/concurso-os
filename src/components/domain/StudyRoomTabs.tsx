'use client';

import { useState } from 'react';
import { QuestionPlayer, Question } from './QuestionPlayer';
import { AILearningPanel } from './AILearningPanel';
import { SchematizedTheoryView } from '@/components/study/SchematizedTheoryView';
import { FinishSessionForm } from '@/components/forms/FinishSessionForm';
import { ReasonList } from './ReasonList';
import { TopicRecommendation } from '@/domain/study-intelligence/types';
import { Target, BookOpen, Sparkles, Clock, ChevronDown, CheckCircle2, Zap, Layers, Flame } from 'lucide-react';
import { useFocus } from '@/context/FocusContext';
import Link from 'next/link';

interface StudyRoomTabsProps {
  recommendation: TopicRecommendation;
  questions: Question[];
  examId: string;
  adaptiveRec: {
    recommendedType: string;
    confidence: string;
    reason: string;
  } | null;
  initialNote?: string;
  allTopics?: { id: string; name: string; subjectName?: string }[];
  initialTab?: 'practice' | 'theory' | 'ai' | 'manual';
}

export function StudyRoomTabs({
  recommendation,
  questions,
  examId,
  adaptiveRec,
  initialNote = '',
  allTopics = [],
  initialTab = 'theory',
}: StudyRoomTabsProps) {
  const [activeTab, setActiveTab] = useState<'practice' | 'theory' | 'ai' | 'manual'>(initialTab);
  const { startFocus, setIsFullscreenZen } = useFocus();

  const handleEnterZenFocus = () => {
    startFocus(recommendation.topicId, recommendation.topicName);
    setIsFullscreenZen(true);
  };

  const priorityConfig: Record<string, { label: string; bg: string }> = {
    CRITICAL: { label: 'Crítico', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    HIGH: { label: 'Alta Prioridade', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    MEDIUM: { label: 'Atenção', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    LOW: { label: 'Normal', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    NORMAL: { label: 'Normal', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const currentPriority = priorityConfig[recommendation.priorityLevel] || priorityConfig.NORMAL;

  return (
    <div className="space-y-6">
      {/* Banner do Tópico Prioritário */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${currentPriority.bg}`}>
                {currentPriority.label}
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                SPI {recommendation.spi}
              </span>
              {adaptiveRec && (
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-500" />
                  <span>Modo: {adaptiveRec.recommendedType}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {recommendation.topicName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Tempo de foco:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {Math.round(recommendation.recommendedHours * 60)} min
                </span>
              </div>

              {allTopics.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">|</span>
                  <span>Mudar tópico:</span>
                  <select
                    value={recommendation.topicId}
                    onChange={(e) => {
                      window.location.href = `/study?topicId=${e.target.value}`;
                    }}
                    className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 outline-hidden cursor-pointer hover:bg-slate-100 transition-colors max-w-[200px] truncate"
                  >
                    {allTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={handleEnterZenFocus}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Entrar em Foco Total (Pomodoro Zen & Ruído Ambiente)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Modo Foco Zen</span>
            </button>

            <Link
              href="/flashcards"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/60 transition-colors"
              title="Acessar Flashcards deste Edital"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Flashcards</span>
            </Link>
          </div>
        </div>

        {/* Motivo do Algoritmo */}
        <div className="pt-3 border-t border-slate-100">
          <details className="text-xs cursor-pointer group">
            <summary className="font-semibold text-slate-600 flex items-center justify-between select-none p-1 rounded hover:bg-slate-50 transition-colors">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Por que este assunto foi priorizado agora?</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-2.5 p-3 rounded-lg bg-slate-50/80 border border-slate-200/70 space-y-2">
              <ReasonList reasons={recommendation.reasons} />
              {adaptiveRec && (
                <div className="pt-2 border-t border-slate-200/50 text-slate-600">
                  <span className="font-bold text-slate-900">Estratégia adaptativa:</span> {adaptiveRec.reason}
                </div>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="p-1 bg-slate-200/70 rounded-xl flex gap-1 text-xs sm:text-sm font-semibold max-w-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 min-w-[150px] sm:min-w-0 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'theory'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Teoria & Lei Seca</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 min-w-[140px] sm:min-w-0 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'practice'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-indigo-600" />
          <span>Resolver Questões</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 min-w-[110px] sm:min-w-0 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Tutor IA</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'manual'
              ? 'bg-white text-slate-950 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Registro Sessão</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'theory' && (
          <SchematizedTheoryView
            topicId={recommendation.topicId}
            initialNote={initialNote}
          />
        )}

        {activeTab === 'practice' && (
          <div>
            {questions.length > 0 ? (
              <QuestionPlayer questions={questions} />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
                <p className="text-sm text-slate-600">
                  Nenhuma questão encontrada especificamente para este assunto.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('theory')}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Estudar Teoria Esquematizada
                  </button>
                  <Link
                    href="/questions/solve"
                    className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200/80 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    Bateria Geral de Questões
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <AILearningPanel
            examId={examId}
            topicId={recommendation.topicId}
            spiPriority={recommendation.spi}
          />
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            <FinishSessionForm recommendation={recommendation} />
          </div>
        )}
      </div>
    </div>
  );
}
