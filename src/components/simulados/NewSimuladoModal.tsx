'use client';

import { useState } from 'react';
import { createSimuladoAction } from '@/app/actions/simulados';
import { Plus, X, Timer, BookOpen, AlertTriangle, Layers, Sparkles, Check } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface NewSimuladoModalProps {
  subjects: Subject[];
}

export function NewSimuladoModal({ subjects }: NewSimuladoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'GENERAL' | 'SUBJECT' | 'MISTAKES'>('GENERAL');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [timeMode, setTimeMode] = useState<'auto' | 'free' | 'custom'>('auto');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate default auto time (3 min per question)
  const autoTime = totalQuestions * 3;
  const computedTimeMinutes = timeMode === 'auto' ? autoTime : timeMode === 'custom' ? customMinutes : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Simulado</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configurar Simulado</h3>
                  <p className="text-xs text-slate-500">Defina o formato de prova para o seu treino</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form 
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await createSimuladoAction(formData);
                } catch (e) {
                  setIsSubmitting(false);
                  console.error(e);
                }
              }}
              className="p-6 overflow-y-auto space-y-5 flex-1"
            >
              <input type="hidden" name="mode" value={mode} />
              <input type="hidden" name="timeLimitMinutes" value={computedTimeMinutes !== null ? computedTimeMinutes : 'null'} />

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título da Prova (Opcional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Simulado Geral Cesgranrio #1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipo de Simulado
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMode('GENERAL')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      mode === 'GENERAL'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-2 ring-indigo-600/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Layers className={`w-4 h-4 mb-1.5 ${mode === 'GENERAL' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">Geral</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Todas as matérias</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('SUBJECT')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      mode === 'SUBJECT'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-2 ring-indigo-600/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 mb-1.5 ${mode === 'SUBJECT' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">Por Matéria</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Foco específico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('MISTAKES')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      mode === 'MISTAKES'
                        ? 'border-rose-600 bg-rose-50/50 text-rose-900 font-semibold ring-2 ring-rose-600/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 mb-1.5 ${mode === 'MISTAKES' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">Erros</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Recuperação</span>
                  </button>
                </div>
              </div>

              {/* Subject selector if SUBJECT mode */}
              {mode === 'SUBJECT' && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selecione a Disciplina
                  </label>
                  <select
                    name="subjectId"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Number of questions selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Quantidade de Questões
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 25].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setTotalQuestions(qty)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        totalQuestions === qty
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {qty} questões
                    </button>
                  ))}
                </div>
                <input type="hidden" name="totalQuestions" value={totalQuestions} />
              </div>

              {/* Time Limit settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pressão de Tempo (Cronômetro)
                  </label>
                  <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    {timeMode === 'free' ? 'Sem limite' : `${computedTimeMinutes} min (${Math.round((computedTimeMinutes! * 60) / totalQuestions)}s/questão)`}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeMode('auto')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      timeMode === 'auto'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-600/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Padrão Concurso</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">3 min / questão</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeMode('custom')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      timeMode === 'custom'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-600/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Personalizado</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{customMinutes} minutos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeMode('free')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      timeMode === 'free'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-600/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Modo Livre</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Sem cronômetro</div>
                  </button>
                </div>

                {timeMode === 'custom' && (
                  <div className="mt-3 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 animate-in fade-in duration-150">
                    <input
                      type="range"
                      min={10}
                      max={180}
                      step={5}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 min-w-[50px] text-right">
                      {customMinutes} min
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Gerando Simulado...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Iniciar Simulado Agora</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
