'use client';

import { useState, useEffect } from 'react';
import { submitQuestionAttempt } from '@/app/actions/questions';
import { explainError } from '@/app/actions/ai';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  HelpCircle, 
  Loader2, 
  BookOpen,
  Clock
} from 'lucide-react';

export interface Question {
  id: string;
  topic_id: string;
  exam_id: string;
  statement: string;
  options: string[];
  correct_option: string;
  explanation?: string | null;
  difficulty?: string | null;
  source_type?: string | null;
  topics?: { name: string } | null;
}

interface QuestionPlayerProps {
  question?: Question;
  questions?: Question[];
  onFinish?: (results: { total: number; correct: number }) => void;
}

export function QuestionPlayer({ question, questions, onFinish }: QuestionPlayerProps) {
  const questionList = questions && questions.length > 0 ? questions : question ? [question] : [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Session stats
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<any>(null);

  const currentQuestion = questionList[currentIndex] || null;

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(false);
    setAiExplanation(null);
    const now = Date.now();
    setStartTime(now);
    setElapsedSeconds(0);
  }, [currentIndex, currentQuestion?.id]);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff?: string | null) => {
    switch (diff?.toUpperCase()) {
      case 'FÁCIL':
      case 'FACIL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DIFÍCIL':
      case 'DIFICIL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200/80 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Nenhuma questão disponível</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Não encontramos questões cadastradas para este tópico no momento.
        </p>
        <div className="pt-2">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selected || submitted) return;
    
    const correct = selected === currentQuestion.correct_option;
    const duration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    
    setIsCorrect(correct);
    setSubmitted(true);
    setTotalAnswered(prev => prev + 1);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }

    try {
      await submitQuestionAttempt(currentQuestion.id, currentQuestion.topic_id, selected, correct, duration);
    } catch (e) {
      console.error('Error submitting attempt:', e);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questionList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
      if (onFinish) {
        onFinish({ total: totalAnswered + 1, correct: correctCount + (isCorrect ? 1 : 0) });
      }
    }
  };

  const handleExplainError = async () => {
    if (!currentQuestion) return;
    setAiLoading(true);
    try {
      const res = await explainError(
        currentQuestion.exam_id, 
        currentQuestion.topic_id, 
        currentQuestion.statement, 
        selected || '', 
        currentQuestion.correct_option
      );
      if (res.success) {
        setAiExplanation(res.data);
      }
    } catch (e) {
      console.error('Error with AI explain:', e);
    } finally {
      setAiLoading(false);
    }
  };

  if (sessionCompleted) {
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Bateria Concluída!</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Você respondeu todas as questões desta sessão. Seus resultados foram processados e calibraram seu plano adaptativo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalAnswered}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Questões</div>
          </div>
          <div className="space-y-0.5 border-x border-slate-200/60">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{correctCount}</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Acertos</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">{accuracy}%</div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Aproveitamento</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.99]"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSessionCompleted(false);
              setCorrectCount(0);
              setTotalAnswered(0);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200/80 shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer Bateria</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 max-w-3xl mx-auto space-y-6">
      {/* Header com Progresso, Tempo e Estatísticas */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 rounded-md">
            Questão {currentIndex + 1} de {questionList.length}
          </span>
          {currentQuestion.difficulty && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </span>
          )}
          {currentQuestion.source_type && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline-flex ${
              currentQuestion.source_type === 'AI_GENERATED'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {currentQuestion.source_type === 'AI_GENERATED' ? 'Inédita IA' : 'Oficial'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          {/* Cronômetro ao vivo */}
          <div 
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/80"
            title="Tempo gasto nesta questão"
          >
            <Clock className={`w-3.5 h-3.5 ${elapsedSeconds > 180 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span className={elapsedSeconds > 180 ? 'text-amber-700' : 'text-slate-700'}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Marcadores de desempenho */}
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{correctCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-1 rounded-lg">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{totalAnswered - correctCount}</span>
          </span>
        </div>
      </div>

      {/* Barra de progresso linear */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questionList.length) * 100}%` }}
        />
      </div>

      {/* Enunciado da Questão - Otimizado para leitura prolongada */}
      <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 sm:p-7 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">#{currentQuestion.id.slice(0, 8)}</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">{currentQuestion.topics?.name || 'Enunciado da Questão'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">Modo de Estudo Concurso</span>
        </div>
        <div className="text-slate-900 text-[15px] sm:text-[16px] leading-[1.75] font-normal tracking-normal select-text whitespace-pre-line font-sans">
          {currentQuestion.statement}
        </div>
      </div>

      {/* Alternativas */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Alternativas
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {submitted ? 'Gabarito e feedback' : 'Selecione uma alternativa para responder'}
          </span>
        </div>

        {currentQuestion.options.map((opt, i) => {
          let containerStyle = "p-4 sm:p-4.5 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-3.5 group select-none relative";
          let badgeStyle = "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all mt-0.5";
          
          if (!submitted) {
            if (selected === opt) {
              containerStyle += " border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/15 font-semibold text-indigo-950 shadow-xs";
              badgeStyle += " bg-indigo-600 text-white shadow-xs";
            } else {
              containerStyle += " border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800 bg-white";
              badgeStyle += " bg-slate-100 text-slate-700 group-hover:bg-slate-200";
            }
          } else {
            if (opt === currentQuestion.correct_option) {
              containerStyle += " border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
              badgeStyle += " bg-emerald-600 text-white shadow-xs";
            } else if (opt === selected) {
              containerStyle += " border-rose-500 bg-rose-50/60 text-rose-950 font-semibold ring-2 ring-rose-500/15";
              badgeStyle += " bg-rose-600 text-white shadow-xs";
            } else {
              containerStyle += " border-slate-200/60 text-slate-400 opacity-55 cursor-default bg-slate-50/30";
              badgeStyle += " bg-slate-100 text-slate-400";
            }
          }

          return (
            <div 
              key={i} 
              className={containerStyle} 
              onClick={() => !submitted && setSelected(opt)}
            >
              <div className={badgeStyle}>
                {String.fromCharCode(65 + i)}
              </div>
              <div className="flex-1 leading-[1.65] pt-0.5 text-[14px] sm:text-[15px]">{opt}</div>
              {submitted && opt === currentQuestion.correct_option && (
                <div className="shrink-0 text-emerald-600 pt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {submitted && opt === selected && opt !== currentQuestion.correct_option && (
                <div className="shrink-0 text-rose-600 pt-0.5">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botões de Ação e Feedback */}
      {!submitted ? (
        <button 
          onClick={handleSubmit} 
          disabled={!selected}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Confirmar Resposta</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {/* Banner de Resultado */}
          <div className={`p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
            isCorrect 
              ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/80 border border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
              {isCorrect ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-emerald-900 font-black">Resposta Correta!</span>
                    <span className="text-xs font-normal text-emerald-700">Fixação consolidada no seu histórico de desempenho.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-rose-900 font-black">Resposta Incorreta</span>
                    <span className="text-xs font-normal text-rose-700">O tópico foi sinalizado para revisão prioritária no motor adaptativo.</span>
                  </div>
                </>
              )}
            </div>
            
            {!isCorrect && (
              <button 
                onClick={handleExplainError}
                disabled={aiLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 active:scale-95 shrink-0"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analisando Erro...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                    <span>Explicar Erro com IA</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Gabarito Comentado / Explicação Didática */}
          {currentQuestion.explanation && (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Gabarito Comentado & Fundamentação Teórica
                  </h4>
                  <span className="text-[11px] text-slate-500">Explicação didática de resolução</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-slate-800 leading-[1.7] whitespace-pre-line font-sans">
                {currentQuestion.explanation}
              </div>
            </div>
          )}

          {/* Diagnóstico Pedagógico com IA */}
          {aiExplanation && (
            <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/30 p-5 rounded-xl space-y-3.5 border border-rose-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                      Diagnóstico Pedagógico com IA
                    </h4>
                    <span className="text-[11px] text-rose-700">Análise cognitiva do seu padrão de resposta</span>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-rose-200">
                  Recalibração
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="p-3 bg-white/80 rounded-lg border border-rose-100">
                  <strong className="block text-rose-950 text-xs font-bold uppercase tracking-wider mb-1">
                    Seu Deslize Conceitual:
                  </strong>
                  <p className="text-slate-800 leading-relaxed">{aiExplanation.identifiedError}</p>
                </div>

                <div className="p-3 bg-white/80 rounded-lg border border-rose-100">
                  <strong className="block text-rose-950 text-xs font-bold uppercase tracking-wider mb-1">
                    Por que a alternativa marcada é inválida:
                  </strong>
                  <p className="text-slate-800 leading-relaxed">{aiExplanation.whyChosenIsWrong}</p>
                </div>

                {aiExplanation.trapRecognition && (
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950 text-xs font-bold uppercase tracking-wider mb-0.5">
                        Alerta de Pegadinha da Banca:
                      </strong>
                      <p className="text-xs text-amber-900 leading-relaxed">{aiExplanation.trapRecognition}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão Próxima Questão */}
          <div className="pt-2">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-slate-950 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-950/10 active:scale-[0.99] cursor-pointer"
            >
              <span>{currentIndex + 1 < questionList.length ? 'Próxima Questão' : 'Finalizar Bateria e Calibrar SPI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
