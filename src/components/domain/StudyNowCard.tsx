import { TopicRecommendation } from '@/domain/study-intelligence/types';
import { ReasonList } from './ReasonList';
import Link from 'next/link';
import { Sparkles, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function StudyNowCard({ recommendation }: { recommendation?: TopicRecommendation }) {
  if (!recommendation) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Tudo em Dia no Momento</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Você não possui pendências críticas no algoritmo de estudo. Continue seguindo seu cronograma semanal.
        </p>
      </div>
    );
  }

  const { topicName, recommendedHours, isInsufficientData, priorityLevel, spi } = recommendation;
  const hoursText = recommendedHours >= 1 
    ? `${Math.floor(recommendedHours)}h${recommendedHours % 1 !== 0 ? '30m' : ''}` 
    : '30 min';

  const priorityBadgeConfig: Record<string, { label: string; classes: string; dotClass: string }> = {
    CRITICAL: {
      label: 'Prioridade Crítica',
      classes: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500'
    },
    HIGH: {
      label: 'Alta Prioridade',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500'
    },
    MEDIUM: {
      label: 'Prioridade Média',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotClass: 'bg-indigo-500'
    },
    LOW: {
      label: 'Prioridade Regular',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400'
    },
    NORMAL: {
      label: 'Prioridade Regular',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400'
    }
  };

  const currentBadge = priorityBadgeConfig[priorityLevel] || priorityBadgeConfig.NORMAL;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/30 border border-indigo-100/80 shadow-sm p-6 sm:p-7 transition-all hover:border-indigo-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs tracking-wide">
              <Sparkles className="w-3 h-3 text-indigo-200" />
              <span>RECOMENDAÇÃO INTELIGENTE</span>
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentBadge.classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dotClass}`} />
              <span>{currentBadge.label}</span>
            </span>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
            SPI: <span className="text-slate-900 font-mono font-black">{spi}</span>
          </div>
        </div>

        {/* Topic Title & Duration */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
            {topicName}
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Tempo de foco sugerido:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-xs font-mono">
              {hoursText}
            </span>
          </div>
        </div>

        {/* Reasons list */}
        <div className="pt-3 border-t border-indigo-100/70">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Diagnóstico do Algoritmo
          </h3>
          {isInsufficientData ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Poucas evidências registradas para este assunto. Inicie esta sessão prática para calibrar seu nível de domínio e a curva de retenção.
              </span>
            </div>
          ) : (
            <ReasonList reasons={recommendation.reasons} />
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Link 
            href="/study"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white font-bold text-sm transition-all duration-200 shadow-sm shadow-slate-950/10 hover:shadow-indigo-600/20 active:scale-[0.99]"
          >
            <span>Iniciar Sessão de Estudo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
