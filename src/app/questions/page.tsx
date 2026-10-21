import { createClient } from '@/lib/supabase/server';
import { fetchQuestionsList } from '@/app/actions/questions-library';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search, Zap, ChevronLeft, ChevronRight, BookOpen, Filter, ArrowUpRight } from 'lucide-react';

export default async function QuestionLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const page = parseInt((resolvedSearchParams.page as string) || '1');
  const query = (resolvedSearchParams.query as string) || '';

  const { data: questions, count } = await fetchQuestionsList({
    page,
    limit: 20,
    query
  });

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
            Acervo Geral
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Biblioteca de Questões
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore, pesquise e pratique as questões cadastradas para o seu edital.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/questions/solve" 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Resolver Bateria</span>
          </Link>
        </div>
      </div>

      {/* Filter and Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Total Catalogado:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
              {count} questões
            </span>
          </div>

          <form className="flex items-center gap-2 w-full sm:w-auto" method="GET">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                name="query" 
                defaultValue={query} 
                placeholder="Buscar termo ou enunciado..." 
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button 
              type="submit" 
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Disciplina / Tópico</th>
                <th className="py-3.5 px-4">Enunciado</th>
                <th className="py-3.5 px-4">Dificuldade</th>
                <th className="py-3.5 px-4">Origem</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {questions && questions.length > 0 ? (
                questions.map((q: any) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      #{q.id.slice(0, 6)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[180px] truncate">
                      {(q.topics as any)?.name || 'Geral'}
                    </td>
                    <td className="py-3.5 px-4 max-w-md truncate text-slate-600 font-normal" title={q.statement}>
                      {q.statement}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(q.difficulty)}`}>
                        {q.difficulty || 'MÉDIA'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        q.source_type === 'AI_GENERATED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {q.source_type === 'AI_GENERATED' ? 'IA' : 'OFICIAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/questions/solve?topicId=${q.topic_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                      >
                        <span>Treinar</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Nenhuma questão encontrada para a sua busca.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <Link 
            href={`/questions?page=${Math.max(1, page - 1)}${query ? `&query=${query}` : ''}`} 
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold ${
              page === 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </Link>

          <span className="font-medium">
            Página <span className="font-bold text-slate-900">{page}</span>
          </span>

          <Link 
            href={`/questions?page=${page + 1}${query ? `&query=${query}` : ''}`} 
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold ${
              (questions?.length || 0) < 20 ? 'opacity-40 pointer-events-none' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span>Próxima</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
