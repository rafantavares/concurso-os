'use client';

import { useState } from 'react';
import { Plus, X, Layers, Sparkles, Check, BookOpen } from 'lucide-react';
import { createFlashcardAction } from '@/app/actions/flashcards';

interface TopicOption {
  id: string;
  name: string;
  subjectName?: string;
}

interface NewFlashcardModalProps {
  topics: TopicOption[];
}

export function NewFlashcardModal({ topics }: NewFlashcardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicId, setTopicId] = useState(topics[0]?.id || '');
  const [category, setCategory] = useState<'GERAL' | 'LEI_SECA' | 'JURISPRUDENCIA' | 'MNEMONICO'>('GERAL');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await createFlashcardAction(formData);
      if (res.success) {
        setIsOpen(false);
        setFront('');
        setBack('');
      } else {
        alert(res.error || 'Erro ao criar flashcard.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Flashcard</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Criar Novo Flashcard</h3>
                  <p className="text-xs text-slate-500">Adicione uma regra, artigo de lei ou mnemônico para repetição espaçada</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tópico / Disciplina
                </label>
                <select
                  name="topicId"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subjectName ? `${t.subjectName} • ` : ''}{t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['GERAL', 'LEI_SECA', 'JURISPRUDENCIA', 'MNEMONICO'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        category === cat
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'LEI_SECA' ? 'Lei Seca' : cat === 'JURISPRUDENCIA' ? 'Súmula / STF' : cat === 'MNEMONICO' ? 'Mnemônico' : 'Geral'}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="category" value={category} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Frente do Card (Pergunta ou Conceito a Lembrar)
                </label>
                <textarea
                  name="front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ex: Quais são as 4 cláusulas pétreas expressas no Art. 60, §4º da CF/88?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Verso do Card (Resposta Completa & Mnemônico)
                </label>
                <textarea
                  name="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  required
                  rows={4}
                  placeholder="Ex: Mnemônico FO-VO-SE-DI: Forma federativa, Voto direto/secreto/periódico, Separação dos poderes e Direitos individuais."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all placeholder:text-slate-400"
                />
              </div>

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
                  disabled={isSubmitting || !front || !back}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Salvar Flashcard</span>
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
