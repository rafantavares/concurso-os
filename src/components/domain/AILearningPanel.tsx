'use client';

import { useState } from 'react';
import { generateSummary, generateFlashcards, generateGuidedReview } from '@/app/actions/ai';
import { 
  Sparkles, 
  BookOpen, 
  RotateCcw, 
  Layers, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  Eye,
  EyeOff,
  Scale,
  HelpCircle
} from 'lucide-react';

interface AILearningPanelProps {
  examId: string;
  topicId: string;
  spiPriority: number;
}

export function AILearningPanel({ examId, topicId, spiPriority }: AILearningPanelProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [showVerificationAnswer, setShowVerificationAnswer] = useState(false);

  const handleAction = async (action: string, fetcher: () => Promise<any>) => {
    setLoadingAction(action);
    setError(null);
    setResult(null);
    setRevealedCards({});
    setShowVerificationAnswer(false);

    try {
      const res = await fetcher();
      if (res.success) {
        setResult({ type: action, data: res.data });
      } else {
        setError(res.error || 'Não foi possível gerar o material no momento.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao consultar a IA.');
    } finally {
      setLoadingAction(null);
    }
  };

  const toggleCard = (index: number) => {
    setRevealedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAllCards = (cardsLength: number) => {
    const allRevealed = Object.keys(revealedCards).length === cardsLength && Object.values(revealedCards).every(Boolean);
    if (allRevealed) {
      setRevealedCards({});
    } else {
      const all: Record<number, boolean> = {};
      for (let i = 0; i < cardsLength; i++) all[i] = true;
      setRevealedCards(all);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tutor de Aprendizagem com IA
            </h3>
            <p className="text-xs text-slate-500">
              Gere sínteses didáticas, revisões guiadas e flashcards sob demanda.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
          AI Learning Engine
        </span>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => handleAction('summary', () => generateSummary(examId, topicId))}
          disabled={loadingAction !== null}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
            result?.type === 'summary'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
          } disabled:opacity-50`}
        >
          {loadingAction === 'summary' ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          ) : (
            <BookOpen className="w-4 h-4 text-indigo-600" />
          )}
          <span>Resumo Conceitual</span>
        </button>

        <button
          onClick={() => handleAction('review', () => generateGuidedReview(examId, topicId))}
          disabled={loadingAction !== null}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
            result?.type === 'review'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
          } disabled:opacity-50`}
        >
          {loadingAction === 'review' ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          ) : (
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          )}
          <span>Revisão Guiada</span>
        </button>

        <button
          onClick={() => handleAction('flashcards', () => generateFlashcards(examId, topicId, 'LOW_PERFORMANCE'))}
          disabled={loadingAction !== null}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
            result?.type === 'flashcards'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
          } disabled:opacity-50`}
        >
          {loadingAction === 'flashcards' ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          ) : (
            <Layers className="w-4 h-4 text-indigo-600" />
          )}
          <span>Gerar Flashcards</span>
        </button>
      </div>

      {/* Loading state message */}
      {loadingAction && (
        <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-medium text-slate-600">
            A IA está estruturando o conteúdo com foco na banca examinadora...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Falha temporária de geração</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Content */}
      {result && result.type === 'summary' && (
        <div className="space-y-5 p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 animate-in fade-in duration-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Síntese Didática Estruturada
                </h4>
                <span className="text-[11px] text-slate-500">Conceitos centrais alinhados ao edital</span>
              </div>
            </div>
            <p className="text-[14px] sm:text-[15px] text-slate-800 leading-[1.8] whitespace-pre-wrap font-sans select-text">
              {result.data.summary}
            </p>
          </div>

          {result.data.criticalBulletPoints && result.data.criticalBulletPoints.length > 0 && (
            <div className="pt-4 border-t border-slate-200/70 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pontos de Maior Recorrência em Prova:</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {result.data.criticalBulletPoints.map((pt: string, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200/70 bg-white flex items-start gap-3 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      {i + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && result.type === 'flashcards' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header do Deck de Flashcards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Deck de Repetição Espaçada ({result.data.flashcards?.length || 0} cards)
                </span>
                <span className="text-[11px] text-emerald-700">
                  Pratique recuperação ativa: tente lembrar antes de revelar
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleAllCards(result.data.flashcards?.length || 0)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/60 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {Object.keys(revealedCards).length === (result.data.flashcards?.length || 0) && Object.values(revealedCards).every(Boolean)
                  ? 'Ocultar Todas'
                  : 'Revelar Todas'}
              </span>
            </button>
          </div>

          {/* Grid de Flashcards com Recuperação Ativa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.data.flashcards?.map((fc: any, i: number) => {
              const isRevealed = !!revealedCards[i];
              return (
                <div 
                  key={i} 
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs ${
                    isRevealed
                      ? 'bg-white border-amber-300 ring-1 ring-amber-300/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      Card #{i + 1}
                    </span>
                    <button
                      onClick={() => toggleCard(i)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-indigo-600" />
                          <span>Ver Resposta</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Frente / Pergunta */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pergunta / Caso Concreto
                    </span>
                    <div className="text-sm sm:text-[15px] font-bold text-slate-950 leading-snug">
                      {fc.question}
                    </div>
                  </div>

                  {/* Verso / Resposta Revelável */}
                  {isRevealed ? (
                    <div className="pt-3 border-t border-amber-100 space-y-2 animate-in fade-in duration-150">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Resposta / Fundamentação:</span>
                      </span>
                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                        {fc.answer}
                      </div>

                      {fc.whyImportantForUser && (
                        <div className="text-[11px] text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-start gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{fc.whyImportantForUser}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => toggleCard(i)}
                      className="py-3 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer group transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 flex items-center justify-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                        <span>Clique para testar e revelar a resposta</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && result.type === 'review' && (
        <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-5 animate-in fade-in duration-200">
          {/* Conceito Fundamental */}
          <div className="space-y-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Conceito Doutrinário Fundamental
              </h4>
            </div>
            <p className="text-[14px] text-slate-800 font-normal leading-[1.75]">
              {result.data.essentialConcept}
            </p>
          </div>

          {/* Erro Típico do Candidato */}
          {result.data.commonUserError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs sm:text-sm">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Ponto Crítico de Confusão / Erro Frequente:</span>
              </span>
              <p className="text-rose-950 leading-relaxed font-normal">{result.data.commonUserError}</p>
            </div>
          )}

          {/* Legislação Aplicada & Jurisprudência */}
          {result.data.example && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 border-l-4 border-l-indigo-600 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Legislação Aplicada / Jurisprudência dos Tribunais:</span>
              </div>
              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3 rounded-lg border border-slate-100 font-mono">
                {result.data.example}
              </div>
            </div>
          )}

          {/* Desafio de Retenção Rápido */}
          {result.data.verificationQuestion && (
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Teste Rápido de Fixação:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Validação Ativa
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                "{result.data.verificationQuestion}"
              </p>

              <div>
                {!showVerificationAnswer ? (
                  <button
                    onClick={() => setShowVerificationAnswer(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Conferir Gabarito do Teste</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-50/80 text-emerald-950 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-start justify-between gap-2 animate-in fade-in duration-150">
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wider text-emerald-800 mb-0.5">
                        Gabarito & Resolução:
                      </strong>
                      <span>{result.data.verificationAnswer}</span>
                    </div>
                    <button
                      onClick={() => setShowVerificationAnswer(false)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold shrink-0 underline"
                    >
                      Ocultar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
