'use client';

import { useActionState } from 'react';
import { registerQuestionBatch } from '@/app/actions/study';
import { CheckCircle2, AlertCircle, Layers } from 'lucide-react';

export function RegisterQuestionsForm({ topics }: { topics: { id: string, name: string }[] }) {
  const [state, formAction, isPending] = useActionState(registerQuestionBatch, { status: 'idle' as const, message: '' });

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Registrar Bateria Externa</h2>
          <p className="text-xs text-slate-500">Lançamento de questões feitas em apostilas, PDFs ou plataformas externas</p>
        </div>
      </div>
      
      {state.status === 'success' && (
        <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Bateria Registrada!</p>
            <p className="text-emerald-700 text-xs mt-0.5">{state.message}</p>
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div className="mb-5 p-3.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Erro no registro</p>
            <p className="text-rose-700 text-xs mt-0.5">{state.message}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Assunto do Edital
          </label>
          <select 
            name="topicId" 
            required 
            className="select-custom w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all cursor-pointer"
          >
            <option value="">Selecione o assunto praticado...</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Total Respondidas
            </label>
            <input 
              type="number" 
              name="total" 
              required 
              min="1" 
              placeholder="Ex: 30"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Acertos Reais
            </label>
            <input 
              type="number" 
              name="correct" 
              required 
              min="0" 
              placeholder="Ex: 24"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-xs hover:shadow active:scale-[0.99] disabled:opacity-50 transition-all mt-2"
        >
          {isPending ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando e calibrando SPI...
            </>
          ) : (
            'Salvar Desempenho da Bateria'
          )}
        </button>
      </form>
    </div>
  );
}
