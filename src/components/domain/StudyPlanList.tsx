import { TopicRecommendation } from '@/domain/study-intelligence/types';
import { ReasonList } from './ReasonList';
import { Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function StudyPlanList({ plan, totalHours }: { plan: TopicRecommendation[], totalHours: number }) {
  const getPriorityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL': 
        return { label: 'Crítico', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HIGH': 
        return { label: 'Alta', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'MEDIUM': 
        return { label: 'Atenção', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default: 
        return { label: 'Normal', bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Cronograma Ativo</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribuição para as próximas {totalHours}h da sua rotina.
          </p>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
          {plan.length} tópicos
        </span>
      </div>

      <div className="space-y-3">
        {plan.map((rec, index) => {
          const hoursText = rec.recommendedHours >= 1 
            ? `${Math.floor(rec.recommendedHours)}h${rec.recommendedHours % 1 !== 0 ? '30m' : ''}` 
            : '30 min';

          const badge = getPriorityBadge(rec.priorityLevel);

          return (
            <div 
              key={rec.topicId} 
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{index + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      SPI {rec.spi}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {rec.topicName}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {hoursText}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                <div className="truncate text-slate-500 max-w-[200px]">
                  {rec.isInsufficientData ? (
                    <span className="italic">Calibrando curva de retenção</span>
                  ) : (
                    <span>{rec.reasons[0]?.context || 'Revisão periódica'}</span>
                  )}
                </div>

                <Link
                  href={`/questions/solve?topicId=${rec.topicId}`}
                  className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] group ml-2"
                >
                  <span>Treinar</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
