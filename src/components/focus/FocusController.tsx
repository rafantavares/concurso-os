'use client';

import { useState, useEffect } from 'react';
import { useFocus } from '@/context/FocusContext';
import { FocusPreset, AmbientSoundType } from '@/domain/focus/types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Flame,
  Radio,
  X,
  CheckCircle2,
  Clock,
  Layers,
  Save,
  Coffee,
  BrainCircuit,
  Compass
} from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  'A dor da disciplina custa gramas; a dor do arrependimento custa toneladas.',
  'O seu nome no Diário Oficial está sendo construído neste minuto exato de foco.',
  'Não estude para passar, estude até passar.',
  'Cada questão resolvida hoje é uma vírgula a menos entre você e a posse.',
  'Constância vence talento em qualquer certame público.',
  'Respire fundo. Apenas uma linha de lei, um raciocínio por vez.'
];

export function FocusController() {
  const {
    isActive,
    isPaused,
    phase,
    secondsRemaining,
    totalSecondsInPhase,
    completedCycles,
    preset,
    ambientSound,
    ambientVolume,
    isMuted,
    isFullscreenZen,
    isWidgetVisible,
    currentTopicName,
    startFocus,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipPhase,
    changePreset,
    changeAmbientSound,
    changeAmbientVolume,
    toggleMute,
    setIsFullscreenZen,
    toggleFullscreenZen,
    setIsWidgetVisible,
    saveAndLogCurrentSession,
  } = useFocus();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Rotate quotes every 45s
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const phaseDetails = {
    FOCUS: {
      label: 'Foco Profundo',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      barColor: 'bg-indigo-500',
      icon: BrainCircuit,
    },
    SHORT_BREAK: {
      label: 'Pausa Restauradora',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      barColor: 'bg-emerald-500',
      icon: Coffee,
    },
    LONG_BREAK: {
      label: 'Pausa Longa (Recompensa)',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      barColor: 'bg-amber-500',
      icon: Coffee,
    },
  }[phase];

  const PhaseIcon = phaseDetails.icon;

  const handleLogSession = async () => {
    setIsLogging(true);
    try {
      const ok = await saveAndLogCurrentSession();
      if (ok) {
        setLogSuccess(true);
        setTimeout(() => setLogSuccess(false), 3000);
      }
    } finally {
      setIsLogging(false);
    }
  };

  // Keyboard shortcut listener for Zen Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreenZen && e.key === 'Escape') {
        setIsFullscreenZen(false);
      }
      if (isFullscreenZen && e.code === 'Space') {
        e.preventDefault();
        if (isPaused) resumeTimer();
        else pauseTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenZen, isPaused]);

  // Calculate percentage for progress circle/bar
  const progressPercent = totalSecondsInPhase > 0
    ? Math.max(0, Math.min(100, Math.round(((totalSecondsInPhase - secondsRemaining) / totalSecondsInPhase) * 100)))
    : 0;

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING MINI CONTROLLER WIDGET                      */}
      {/* ======================================================== */}
      {isWidgetVisible && !isFullscreenZen && (
        <div className="fixed bottom-5 right-5 z-40 bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${phase === 'FOCUS' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                {phaseDetails.label}
              </span>
              <span className="text-xl font-black font-mono tracking-tight text-white leading-none">
                {formatTime(secondsRemaining)}
              </span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800 mx-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {isPaused ? (
              <button
                onClick={resumeTimer}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-xs"
                title="Retomar"
              >
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                title="Pausar"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <button
              onClick={skipPhase}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Avançar Fase"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFullscreenZen}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white flex items-center justify-center transition-colors"
              title="Modo Tela Cheia Imersivo"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsWidgetVisible(false)}
              className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors ml-1"
              title="Minimizar (continua no fundo)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FULLSCREEN IMMERSIVE ZEN OVERLAY                     */}
      {/* ======================================================== */}
      {isFullscreenZen && (
        <div className="fixed inset-0 z-50 bg-slate-950/98 text-slate-100 flex flex-col justify-between p-6 sm:p-10 backdrop-blur-2xl animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${phaseDetails.color}`}>
                <PhaseIcon className="w-3.5 h-3.5" />
                <span>{phaseDetails.label}</span>
              </span>

              {currentTopicName && (
                <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                  Focado em: <strong className="text-slate-200">{currentTopicName}</strong>
                </span>
              )}
            </div>

            {/* Presets switcher */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl text-xs font-bold border border-slate-800">
                <button
                  onClick={() => changePreset('CLASSIC_25_5')}
                  className={`px-3 py-1 rounded-lg transition-colors ${preset === 'CLASSIC_25_5' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  25 / 5
                </button>
                <button
                  onClick={() => changePreset('DEEP_50_10')}
                  className={`px-3 py-1 rounded-lg transition-colors ${preset === 'DEEP_50_10' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  50 / 10
                </button>
                <button
                  onClick={() => changePreset('SPEED_15_3')}
                  className={`px-3 py-1 rounded-lg transition-colors ${preset === 'SPEED_15_3' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  15 / 3
                </button>
              </div>

              <button
                onClick={toggleFullscreenZen}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Sair do Modo Imersivo (ESC)"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar ao Estudo</span>
              </button>
            </div>
          </div>

          {/* Center Main Stage */}
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-6 max-w-2xl mx-auto">
            {/* Cycle indicator dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((idx) => {
                const isCurrent = completedCycles % 4 === idx;
                const isDone = (completedCycles % 4) > idx;
                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      isDone
                        ? 'w-7 bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : isCurrent
                        ? 'w-9 bg-indigo-500 animate-pulse'
                        : 'w-2 bg-slate-800'
                    }`}
                    title={`Ciclo ${idx + 1} de 4`}
                  />
                );
              })}
              <span className="text-[11px] font-mono text-slate-400 ml-2">
                Ciclo {(completedCycles % 4) + 1} de 4
              </span>
            </div>

            {/* Huge Digital Timer */}
            <div className="space-y-2">
              <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-md select-none">
                {formatTime(secondsRemaining)}
              </div>
              <p className="text-xs text-slate-500">
                Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">Espaço</kbd> para pausar ou continuar
              </p>
            </div>

            {/* Motivational Quote */}
            <div className="max-w-lg min-h-[48px] flex items-center justify-center">
              <p className="text-xs sm:text-sm text-indigo-200/80 italic font-serif leading-relaxed">
                "{MOTIVATIONAL_QUOTES[quoteIndex]}"
              </p>
            </div>

            {/* Primary Control Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={resetTimer}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
                title="Reiniciar Ciclo"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Continuar Foco</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base border border-slate-700 flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pausar</span>
                </button>
              )}

              <button
                onClick={skipPhase}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
                title="Pular para Próxima Fase"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Controls: Sound Generator & Session Log */}
          <div className="border-t border-slate-900 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Ambient Sound Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Som Ambiente:</span>
              </span>

              <button
                onClick={() => changeAmbientSound('OFF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  ambientSound === 'OFF'
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-white'
                }`}
              >
                Mudo
              </button>

              <button
                onClick={() => changeAmbientSound('BROWN_NOISE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  ambientSound === 'BROWN_NOISE'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Ruído Marrom</span>
              </button>

              <button
                onClick={() => changeAmbientSound('RAIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  ambientSound === 'RAIN'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-white'
                }`}
              >
                <CloudRain className="w-3 h-3 text-blue-400" />
                <span>Chuva Suave</span>
              </button>

              <button
                onClick={() => changeAmbientSound('ALPHA_WAVES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  ambientSound === 'ALPHA_WAVES'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 text-purple-400" />
                <span>Ondas Alfa (432Hz)</span>
              </button>

              {ambientSound !== 'OFF' && (
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : ambientVolume}
                    onChange={(e) => changeAmbientVolume(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Log & Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogSession}
                disabled={isLogging}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {logSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tempo Salvo no Dashboard!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Minutos Estudados</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
