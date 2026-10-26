import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NewSimuladoModal } from '@/components/simulados/NewSimuladoModal';
import { 
  Award, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Play, 
  BarChart2, 
  Sparkles,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';

export default async function SimuladosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userExams } = await supabase
    .from('user_exams')
    .select('exam_id')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })
    .limit(1);

  if (!userExams || userExams.length === 0) redirect('/dashboard');
  const primaryExamId = userExams[0].exam_id;

  // Fetch subjects for filter in modal
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('exam_id', primaryExamId);

  const subjects = (subjectsData || []).map((s: any) => ({ id: s.id, name: s.name }));

  // Fetch historical simulados
  const { data: simuladosData } = await supabase
    .from('simulados')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const simulados = (simuladosData || []).map((s: any) => ({
    ...s,
    question_ids: Array.isArray(s.question_ids) ? s.question_ids : JSON.parse(s.question_ids || '[]'),
    answers_payload: typeof s.answers_payload === 'object' && s.answers_payload !== null 
      ? s.answers_payload 
      : JSON.parse(s.answers_payload || '{}'),
  }));

  const completedSimulados = simulados.filter((s: any) => s.status === 'COMPLETED');
  const totalCompleted = completedSimulados.length;
  
  const avgScore = totalCompleted > 0
    ? Math.round(completedSimulados.reduce((acc: number, cur: any) => acc + (cur.score_percentage || 0), 0) / totalCompleted)
    : 0;

  const totalQuestionsDone = completedSimulados.reduce(
    (acc: number, cur: any) => acc + (cur.correct_answers || 0) + (cur.wrong_answers || 0), 
    0
  );

  const bestScore = totalCompleted > 0
    ? Math.max(...completedSimulados.map((s: any) => s.score_percentage || 0))
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
              Treinamento de Alto Rendimento
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Simulados & Provas Cronometradas
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Treine com pressão de tempo real, simule as condições do edital e meça sua velocidade de prova antes do grande dia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NewSimuladoModal subjects={subjects} />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Simulados Feitos</span>
            <span className="text-2xl font-black text-slate-900">{totalCompleted}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Média de Acertos</span>
            <span className="text-2xl font-black text-slate-900">{avgScore}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Questões em Prova</span>
            <span className="text-2xl font-black text-slate-900">{totalQuestionsDone}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Melhor Desempenho</span>
            <span className="text-2xl font-black text-slate-900">{bestScore}%</span>
          </div>
        </div>
      </div>

      {/* History & Active Simulados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Histórico de Simulados</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {simulados.length}
            </span>
          </h2>
        </div>

        {simulados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
              <Timer className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Nenhum simulado realizado ainda</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Realizar simulados cronometrados treina a sua mente para controlar a ansiedade e administrar o tempo de cada questão na prova oficial.
              </p>
            </div>
            <div className="pt-2">
              <NewSimuladoModal subjects={subjects} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulados.map((sim: any) => {
              const isCompleted = sim.status === 'COMPLETED';
              const durationMin = Math.round((sim.time_spent_seconds || 0) / 60);

              return (
                <div 
                  key={sim.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isCompleted 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isCompleted ? 'Concluído' : 'Em Andamento'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sim.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {sim.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sim.total_questions} questões • {sim.time_limit_minutes ? `${sim.time_limit_minutes} min de limite` : 'Modo livre'}
                      </p>
                    </div>

                    {isCompleted && (
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-black ${
                          sim.score_percentage >= 70 ? 'text-emerald-600' : sim.score_percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {sim.score_percentage}%
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">Aproveitamento</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Bar */}
                  {isCompleted ? (
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-around border border-slate-100 text-center">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {sim.correct_answers}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Acertos</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          {sim.wrong_answers}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Erros</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          {sim.unanswered}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Em branco</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-indigo-500" />
                          {durationMin}m
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Tempo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
                      <span>Prova iniciada e pausada. Suas respostas salvas aguardam conclusão.</span>
                    </div>
                  )}

                  {/* Action Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    {isCompleted ? (
                      <Link
                        href={`/simulados/${sim.id}/resultado`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <span>Ver Gabarito & Relatório Detalhado</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/simulados/${sim.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Continuar Simulado</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
