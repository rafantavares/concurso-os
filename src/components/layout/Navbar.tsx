'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  HelpCircle, 
  Zap, 
  AlertCircle, 
  RefreshCw, 
  BarChart3, 
  MessageSquare,
  LogOut,
  GraduationCap,
  Timer
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on login or onboarding pages
  if (pathname === '/login' || pathname === '/onboarding') {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Estudar Agora', href: '/study', icon: Target, highlight: true },
    { label: 'Simulados', href: '/simulados', icon: Timer },
    { label: 'Questões', href: '/questions', icon: HelpCircle },
    { label: 'Bateria Rápida', href: '/questions/solve', icon: Zap },
    { label: 'Caderno de Erros', href: '/mistakes', icon: AlertCircle },
    { label: 'Revisões', href: '/reviews', icon: RefreshCw },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    ConcursoOS
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    BETA
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 tracking-tight leading-none hidden sm:inline">
                  Adaptive Learning System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                if (item.highlight) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                        isActive
                          ? 'bg-indigo-700 text-white ring-2 ring-indigo-700/20 shadow-indigo-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15 hover:shadow-indigo-600/25'
                      }`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 text-indigo-600 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200/80"
              title="Enviar feedback ou reportar bug"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Feedback</span>
            </Link>

            <div className="h-4 w-px bg-slate-200/80 hidden sm:block" />

            <form action="/auth/sign-out" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50/80 transition-colors cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Slider */}
      <div className="lg:hidden border-t border-slate-100 px-3 py-2 flex items-center overflow-x-auto gap-1.5 scrollbar-none bg-slate-50/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                item.highlight
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : isActive
                  ? 'bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:bg-white/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
