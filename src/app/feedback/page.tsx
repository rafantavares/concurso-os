'use client';

import { useActionState } from 'react';
import { submitFeedback } from '@/app/actions/feedback';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function FeedbackPage() {
  const [state, formAction, isPending] = useActionState(submitFeedback, { status: 'idle', message: '' });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Beta Feedback</h1>
          <p className="text-xs text-slate-500 mt-1">
            Encontrou uma falha ou tem uma ideia de melhoria? Seu relato calibra as prioridades do ConcursoOS.
          </p>
        </div>

        {state.status === 'success' && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Feedback registrado com sucesso!</strong>
              <span>{state.message}</span>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Erro no envio</strong>
              <span>{state.message}</span>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Relato
            </label>
            <select 
              name="type" 
              required 
              className="select-custom w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 cursor-pointer"
            >
              <option value="BUG">Bug / Falha Técnica</option>
              <option value="SUGGESTION">Sugestão de Funcionalidade</option>
              <option value="DIFFICULTY">Dificuldade de Uso (UX)</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição Detalhada
            </label>
            <textarea 
              name="description" 
              required 
              rows={4} 
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
              placeholder="Descreva o que ocorreu ou como a plataforma poderia te atender melhor..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Onde Ocorreu (Opcional)
            </label>
            <input 
              type="text" 
              name="context" 
              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
              placeholder="Ex: Sala de Estudo Ativo / Resolução de Questões"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-3.5 bg-slate-950 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando Relato...</span>
              </>
            ) : (
              <span>Enviar Feedback</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
