import { ExplanationReason } from '@/domain/study-intelligence/types';
import { CheckCircle2 } from 'lucide-react';

export function ReasonList({ reasons }: { reasons: ExplanationReason[] }) {
  if (!reasons || reasons.length === 0) {
    return <p className="text-xs text-slate-500 italic">Revisão e manutenção de rotina.</p>;
  }

  return (
    <ul className="space-y-1.5" aria-label="Motivos da recomendação">
      {reasons.map((r, idx) => (
        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <span>{r.context}</span>
        </li>
      ))}
    </ul>
  );
}
