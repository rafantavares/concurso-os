'use client';

import { useState, useEffect, useTransition } from 'react';
import { TopicTheory, getTheoryForTopic } from '@/domain/theory/theoryData';
import { saveTopicNoteAction, addTheoryFlashcardAction } from '@/app/actions/theory';
import {
  BookOpen,
  Scale,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  PlusCircle,
  FileText,
  Search,
  BookmarkCheck,
  Layers,
  ArrowRight,
  HelpCircle,
  Table,
  CheckCircle2,
  Save,
  Loader2,
  Compass
} from 'lucide-react';
import Link from 'next/link';

interface SchematizedTheoryViewProps {
  topicId: string;
  initialNote?: string;
}

export function SchematizedTheoryView({ topicId, initialNote = '' }: SchematizedTheoryViewProps) {
  const theory = getTheoryForTopic(topicId);

  const [activeSubTab, setActiveSubTab] = useState<'lei' | 'esquemas' | 'comparacoes' | 'jurisprudencia' | 'anotacoes'>('lei');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Note taking state
  const [noteContent, setNoteContent] = useState(initialNote);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(initialNote ? 'Carregada' : null);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // If initial note changes from server
  useEffect(() => {
    if (initialNote) {
      setNoteContent(initialNote);
    }
  }, [initialNote]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      const res = await saveTopicNoteAction(topicId, noteContent);
      if (res.success) {
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAddFlashcard = (id: string, front: string, back: string, category: string) => {
    startTransition(async () => {
      const res = await addTheoryFlashcardAction(topicId, front, back, category);
      if (res.success) {
        setAddedCardId(id);
        setTimeout(() => setAddedCardId(null), 2500);
      }
    });
  };

  if (!theory) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-4">
        <Compass className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Teoria em Elaboração</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          O resumo esquematizado e lei seca para este assunto específico estão sendo formatados pela nossa equipe pedagógica. Utilize a aba "Teoria & IA" para gerar uma síntese personalizada instantânea.
        </p>
      </div>
    );
  }

  // Filter items by search
  const query = searchTerm.toLowerCase().trim();
  const filteredLeiSeca = theory.leiSeca.filter(
    (item) =>
      !query ||
      item.artigo.toLowerCase().includes(query) ||
      item.texto.toLowerCase().includes(query) ||
      item.pegadinhas.some((p) => p.toLowerCase().includes(query))
  );

  const filteredEsquemas = theory.esquemas.filter(
    (item) =>
      !query ||
      item.titulo.toLowerCase().includes(query) ||
      item.descricao.toLowerCase().includes(query) ||
      item.itens.some((i) => i.chave.toLowerCase().includes(query) || i.significado.toLowerCase().includes(query))
  );

  const filteredComparacoes = theory.comparacoes.filter(
    (item) =>
      !query ||
      item.titulo.toLowerCase().includes(query) ||
      item.descricao.toLowerCase().includes(query)
  );

  const filteredJurisprudencia = theory.jurisprudencia.filter(
    (item) =>
      !query ||
      item.numero.toLowerCase().includes(query) ||
      item.enunciado.toLowerCase().includes(query) ||
      item.comentario.toLowerCase().includes(query)
  );

  const relevanceBadge = (rel: string) => {
    switch (rel) {
      case 'EXTREMA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Relevância Extrema</span>;
      case 'MUITO_ALTA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Muito Cobrado</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Alta Relevância</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Overview Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-indigo-200 px-2.5 py-0.5 rounded-full border border-white/10">
              {theory.subjectName}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Curadoria Concurso-OS</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {theory.topicName}
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-3xl">
            {theory.resumoGeral}
          </p>

          {/* Keywords tags */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-indigo-300/80 font-medium mr-1">Tópicos-chave:</span>
            {theory.palavrasChave.map((kw, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-md text-white border border-white/10 transition-colors"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Navigation pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('lei')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'lei'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lei Seca Grifada</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'lei' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {theory.leiSeca.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('esquemas')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'esquemas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Esquemas & Mnemônicos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'esquemas' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {theory.esquemas.length}
            </span>
          </button>

          {theory.comparacoes.length > 0 && (
            <button
              onClick={() => setActiveSubTab('comparacoes')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'comparacoes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabelas Comparativas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'comparacoes' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {theory.comparacoes.length}
              </span>
            </button>
          )}

          {theory.jurisprudencia.length > 0 && (
            <button
              onClick={() => setActiveSubTab('jurisprudencia')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'jurisprudencia'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Súmulas & STF/STJ</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === 'jurisprudencia' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {theory.jurisprudencia.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('anotacoes')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'anotacoes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Minhas Anotações</span>
            {lastSavedTime && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Quick Filter */}
        <div className="relative min-w-[200px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar nesta matéria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-hidden text-slate-900"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. LEI SECA GRIFADA                                      */}
      {/* ======================================================== */}
      {activeSubTab === 'lei' && (
        <div className="space-y-4">
          {filteredLeiSeca.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Nenhum artigo encontrado com o termo "{searchTerm}".
            </div>
          ) : (
            filteredLeiSeca.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all space-y-4 group"
              >
                {/* Header of article */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                      {item.artigo} • {item.diploma}
                    </span>
                    {relevanceBadge(item.relevancia)}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopyText(item.id, `${item.artigo} (${item.diploma}):\n${item.texto}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1 font-medium"
                      title="Copiar Artigo"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px] font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleAddFlashcard(
                          item.id,
                          `[LEI SECA] O que diz o ${item.artigo} da ${item.diploma}?`,
                          item.texto + (item.pegadinhas.length > 0 ? `\n\n⚠️ Pegadinha: ${item.pegadinhas[0]}` : ''),
                          'LEI_SECA'
                        )
                      }
                      disabled={isPending}
                      className="p-1.5 px-2.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition-colors text-xs flex items-center gap-1.5 font-bold"
                    >
                      {addedCardId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 text-[11px]">Adicionado ao Anki!</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Criar Flashcard</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Article Text with enhanced readability */}
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 whitespace-pre-line">
                  {item.texto}
                </div>

                {/* Pegadinhas de Banca Box */}
                {item.pegadinhas.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Como as Bancas Examinadoras Cobram (Pegadinhas):</span>
                    </div>
                    <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-950/90 leading-relaxed">
                      {item.pegadinhas.map((peg, idx) => (
                        <li key={idx} className="marker:text-amber-500">
                          {peg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ESQUEMAS & MNEMÔNICOS                                 */}
      {/* ======================================================== */}
      {activeSubTab === 'esquemas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEsquemas.length === 0 ? (
            <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Nenhum esquema encontrado.
            </div>
          ) : (
            filteredEsquemas.map((esq) => (
              <div
                key={esq.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {esq.tipo}
                    </span>
                    {esq.mnemonicoBadge && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {esq.mnemonicoBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {esq.titulo}
                  </h3>

                  <p className="text-xs text-slate-600">
                    {esq.descricao}
                  </p>

                  {/* Schema breakdown */}
                  <div className="space-y-2 pt-1">
                    {esq.itens.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {it.chave}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{it.significado}</p>
                          {it.destaque && (
                            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                              • {it.destaque}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {esq.dicaBanca && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 font-medium">
                      💡 <span className="font-bold">Dica da Prova:</span> {esq.dicaBanca}
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const backText = esq.itens.map(i => `• ${i.chave}: ${i.significado}`).join('\n') + (esq.dicaBanca ? `\n\n💡 Dica: ${esq.dicaBanca}` : '');
                      handleAddFlashcard(
                        esq.id,
                        `[ESQUEMA] Como funciona o mnemônico/esquema: ${esq.titulo}?`,
                        backText,
                        'MNEMONICO'
                      );
                    }}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-colors"
                  >
                    {addedCardId === esq.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Salvo nos seus Flashcards!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Adicionar este Esquema ao Anki</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TABELAS COMPARATIVAS                                  */}
      {/* ======================================================== */}
      {activeSubTab === 'comparacoes' && (
        <div className="space-y-6">
          {filteredComparacoes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Nenhuma tabela comparativa encontrada.
            </div>
          ) : (
            filteredComparacoes.map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      {comp.titulo}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {comp.descricao}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3.5 sm:px-4 w-1/4">{comp.colunas[0]}</th>
                        <th className="p-3.5 sm:px-4 w-3/8 text-indigo-900 bg-indigo-50/50">{comp.colunas[1]}</th>
                        <th className="p-3.5 sm:px-4 w-3/8 text-slate-900">{comp.colunas[2]}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comp.linhas.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 sm:px-4 font-bold text-slate-900 bg-slate-50/40">
                            {row.criterio}
                          </td>
                          <td className="p-3.5 sm:px-4 text-slate-700 leading-relaxed bg-indigo-50/20">
                            {row.itemA}
                          </td>
                          <td className="p-3.5 sm:px-4 text-slate-700 leading-relaxed">
                            {row.itemB}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. JURISPRUDÊNCIA & SÚMULAS                              */}
      {/* ======================================================== */}
      {activeSubTab === 'jurisprudencia' && (
        <div className="space-y-4">
          {filteredJurisprudencia.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Nenhuma súmula cadastrada para este assunto.
            </div>
          ) : (
            filteredJurisprudencia.map((jur) => (
              <div
                key={jur.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                      {jur.tribunal}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {jur.numero}
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {jur.impacto}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 font-serif text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                  "{jur.enunciado}"
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">Comentário Doutrinário:</span> {jur.comentario}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      handleAddFlashcard(
                        jur.id,
                        `[JURISPRUDÊNCIA] O que estabelece a ${jur.numero} do ${jur.tribunal}?`,
                        `${jur.enunciado}\n\nComentário: ${jur.comentario}`,
                        'JURISPRUDENCIA'
                      )
                    }
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    {addedCardId === jur.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Adicionado!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Adicionar Súmula ao Baralho</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MINHAS ANOTAÇÕES PESSOAIS                             */}
      {/* ======================================================== */}
      {activeSubTab === 'anotacoes' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Caderno Pessoal de Anotações</span>
              </h3>
              <p className="text-xs text-slate-500">
                Escreva seus próprios resumos, mnemônicos e pontos de atenção. Ficam salvos automaticamente no banco de dados.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {lastSavedTime && (
                <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvo {lastSavedTime}</span>
                </span>
              )}

              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Anotação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={12}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Digite aqui suas observações sobre este assunto... Exemplo: Pegadinha que errei no simulado: não confundir competência privativa com concorrente..."
              className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden font-sans leading-relaxed resize-y transition-all"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{noteContent.length} caracteres digitados</span>
              <button
                onClick={() => handleCopyText('notes', noteContent)}
                className="hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedId === 'notes' ? 'Copiado para área de transferência!' : 'Copiar minhas anotações'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-packaged Flashcards Bar at bottom */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Flashcards Disponíveis Deste Tópico
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            Quer fixar este conteúdo na memória de longo prazo? Pratique os cards com repetição espaçada SM-2.
          </p>
        </div>

        <Link
          href="/flashcards"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>Abrir no Anki / SM-2</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
