'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Timer, 
  ArrowLeft, 
  BarChart3, 
  BookOpen, 
  Check, 
  X, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QuestionWithTopic, SimuladoRecord, SubjectStat } from '@/domain/simulados/types';

interface SimuladoResultViewProps {
  simulado: SimuladoRecord;
  questions: QuestionWithTopic[];
  subjectStats: SubjectStat[];
}

export function SimuladoResultView({ simulado, questions, subjectStats }: SimuladoResultViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'ERRORS' | 'CORRECT' | 'BLANK'>('ALL');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  const toggleExplanation = (qId: string) => {
    setExpandedExplanation((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const totalQuestions = questions.length;
  const correct = simulado.correct_answers || 0;
  const wrong = simulado.wrong_answers || 0;
  const blank = simulado.unanswered || 0;
  const score = simulado.score_percentage || 0;

  const totalSecs = simulado.time_spent_seconds || 0;
  const totalMinutes = Math.floor(totalSecs / 60);
  const avgSecsPerQ = totalQuestions > 0 ? Math.round(totalSecs / totalQuestions) : 0;

  // Grade classification
  const getBadgeClassification = () => {
    if (score >= 80) return { label: 'Desempenho de Elite • Faixa de Aprovação', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 65) return { label: 'Bom Desempenho • Quase no Corte', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 50) return { label: 'Desempenho Regular • Necessita Reforço', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Abaixo da Média • Requer Revisão Urgente', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const classification = getBadgeClassification();

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const ans = simulado.answers_payload?.[q.id];
    if (filter === 'ERRORS') return ans?.isCorrect === false;
    if (filter === 'CORRECT') return ans?.isCorrect === true;
    if (filter === 'BLANK') return !ans?.selectedOption;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/simulados"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Simulados</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Ir para Dashboard
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            href="/mistakes"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
          >
            Caderno de Erros
          </Link>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left score ring / info */}
          <div className="md:col-span-7 space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block ${classification.color}`}>
              {classification.label}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {simulado.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
              Prova finalizada e corrigida pelo sistema. Suas respostas já foram computadas no cálculo do seu SPI e cadastradas para repetição espaçada.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium">
                <Timer className="w-4 h-4 text-indigo-600" />
                Tempo: <strong>{totalMinutes}min</strong> ({avgSecsPerQ}s / questão)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-medium">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Total: <strong>{totalQuestions} questões</strong>
              </span>
            </div>
          </div>

          {/* Right big circular score */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
            <div className={`text-5xl sm:text-6xl font-black tracking-tight ${
              score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {score}%
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Aproveitamento Líquido
            </span>

            {/* Quick mini-counters */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-200/60 w-full text-xs">
              <div className="text-center">
                <span className="text-base font-black text-emerald-600 block">{correct}</span>
                <span className="text-[10px] text-slate-400">Acertos</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <span className="text-base font-black text-rose-600 block">{wrong}</span>
                <span className="text-[10px] text-slate-400">Erros</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <span className="text-base font-black text-slate-600 block">{blank}</span>
                <span className="text-[10px] text-slate-400">Em branco</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raio-X por Disciplina */}
      {subjectStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Raio-X de Desempenho por Disciplina</span>
            </h2>
            <span className="text-xs text-slate-400">Análise de pontos fortes e fracos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectStats.map((stat) => (
              <div 
                key={stat.subjectId}
                className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 line-clamp-1">{stat.subjectName}</span>
                  <span className={`font-black ${
                    stat.percentage >= 70 ? 'text-emerald-600' : stat.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {stat.percentage}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      stat.percentage >= 70 ? 'bg-emerald-500' : stat.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{stat.correct} de {stat.total} acertos</span>
                  <span>{stat.total - stat.correct} erro(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gabarito Comentado Interativo */}
      <div className="space-y-4">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Gabarito Comentado</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {filteredQuestions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Revise questão por questão com justificativa jurídica e fundamentação completa.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs self-start">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas ({totalQuestions})
            </button>
            <button
              onClick={() => setFilter('ERRORS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ERRORS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Erros ({wrong})
            </button>
            <button
              onClick={() => setFilter('CORRECT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'CORRECT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Acertos ({correct})
            </button>
            {blank > 0 && (
              <button
                onClick={() => setFilter('BLANK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'BLANK'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Em Branco ({blank})
              </button>
            )}
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => {
            const originalIndex = questions.findIndex((orig) => orig.id === q.id);
            const ans = simulado.answers_payload?.[q.id];
            const isCorrect = ans?.isCorrect === true;
            const isWrong = ans?.isCorrect === false;
            const isBlank = !ans?.selectedOption;
            const isExpanded = !!expandedExplanation[q.id];

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs transition-all space-y-4 ${
                  isCorrect
                    ? 'border-emerald-200/80 hover:border-emerald-300'
                    : isWrong
                    ? 'border-rose-200/80 hover:border-rose-300'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Question Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Questão {originalIndex + 1}
                    </span>
                    {q.subject_name && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                        {q.subject_name}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      {q.topic_name || 'Tópico Geral'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Ano: {q.year}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Você Acertou</span>
                      </span>
                    )}
                    {isWrong && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Você Errou</span>
                      </span>
                    )}
                    {isBlank && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Não Respondida</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Statement */}
                <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line">
                  {q.statement}
                </div>

                {/* Alternatives with visual indicators */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex);
                    const isOfficialCorrect = opt === q.correct_option;
                    const isCandidateChoice = ans?.selectedOption === opt;

                    return (
                      <div
                        key={optIndex}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all ${
                          isOfficialCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-400/20'
                            : isCandidateChoice && !isOfficialCorrect
                            ? 'bg-rose-50/80 border-rose-300 text-rose-950 ring-1 ring-rose-400/20'
                            : 'bg-white border-slate-100 text-slate-600'
                        }`}
                      >
                        {/* Letter */}
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isOfficialCorrect
                            ? 'bg-emerald-600 text-white'
                            : isCandidateChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {letter}
                        </div>

                        {/* Text */}
                        <div className="flex-1 leading-relaxed">
                          {opt}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
                          {isCandidateChoice && (
                            <span className={`px-2 py-0.5 rounded-md ${
                              isOfficialCorrect 
                                ? 'bg-emerald-200/60 text-emerald-800' 
                                : 'bg-rose-200/60 text-rose-800'
                            }`}>
                              Sua Escolha
                            </span>
                          )}
                          {isOfficialCorrect && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Gabarito
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation Accordion */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar Justificativa & Lei Seca' : 'Ver Comentário do Professor & Fundamentação'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Fundamentação da Banca:</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-700">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
