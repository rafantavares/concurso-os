import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const days = [
    { label: 'Seg', value: 'Segunda' },
    { label: 'Ter', value: 'Terça' },
    { label: 'Qua', value: 'Quarta' },
    { label: 'Qui', value: 'Quinta' },
    { label: 'Sex', value: 'Sexta' },
    { label: 'Sáb', value: 'Sábado' },
    { label: 'Dom', value: 'Domingo' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white p-7 sm:p-9 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Configure sua Rotina</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Para que o motor adaptativo distribua suas metas e revisões, defina sua disponibilidade real.
          </p>
        </div>
        
        <form className="space-y-5" action="/api/profile/update" method="post">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Horas de Estudo por Semana</span>
            </label>
            <input 
              type="number" 
              name="hours_per_week" 
              required 
              min="1" 
              max="168" 
              defaultValue={10}
              className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono font-semibold" 
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Exemplo: 10 a 25 horas semanais</span>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Dias da Semana com Disponibilidade
            </label>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map(d => (
                <label 
                  key={d.value} 
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all text-center select-none has-[:checked]:bg-indigo-50/90 has-[:checked]:border-indigo-600 has-[:checked]:text-indigo-950 has-[:checked]:shadow-2xs"
                >
                  <input 
                    type="checkbox" 
                    name="available_days" 
                    value={d.value} 
                    defaultChecked
                    className="sr-only" 
                  />
                  <span className="text-[11px] sm:text-xs font-bold">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Salvar Rotina e Ir ao Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
