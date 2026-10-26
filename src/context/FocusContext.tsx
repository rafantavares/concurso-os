'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FocusPreset, CyclePhase, AmbientSoundType, FocusSettings } from '@/domain/focus/types';
import { ambientAudio } from '@/domain/focus/ambientAudio';
import { recordFocusSessionAction } from '@/app/actions/focus';

interface FocusContextType {
  isActive: boolean;
  isPaused: boolean;
  phase: CyclePhase;
  secondsRemaining: number;
  totalSecondsInPhase: number;
  completedCycles: number;
  preset: FocusPreset;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  isMuted: boolean;
  isFullscreenZen: boolean;
  isWidgetVisible: boolean;
  currentTopicId?: string;
  currentTopicName?: string;
  totalFocusedMinutesToday: number;

  // Actions
  startFocus: (topicId?: string, topicName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  changePreset: (preset: FocusPreset) => void;
  changeAmbientSound: (type: AmbientSoundType) => void;
  changeAmbientVolume: (vol: number) => void;
  toggleMute: () => void;
  setIsFullscreenZen: (open: boolean) => void;
  toggleFullscreenZen: () => void;
  setIsWidgetVisible: (visible: boolean) => void;
  saveAndLogCurrentSession: () => Promise<boolean>;
}

const PRESET_DURATIONS: Record<FocusPreset, { focus: number; shortBreak: number; longBreak: number }> = {
  CLASSIC_25_5: { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
  DEEP_50_10: { focus: 50 * 60, shortBreak: 10 * 60, longBreak: 20 * 60 },
  SPEED_15_3: { focus: 15 * 60, shortBreak: 3 * 60, longBreak: 10 * 60 },
  STOPWATCH: { focus: 0, shortBreak: 5 * 60, longBreak: 15 * 60 },
};

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<FocusPreset>('CLASSIC_25_5');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [phase, setPhase] = useState<CyclePhase>('FOCUS');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PRESET_DURATIONS.CLASSIC_25_5.focus);
  const [totalSecondsInPhase, setTotalSecondsInPhase] = useState<number>(PRESET_DURATIONS.CLASSIC_25_5.focus);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalFocusedMinutesToday, setTotalFocusedMinutesToday] = useState<number>(0);

  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('OFF');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [isFullscreenZen, setIsFullscreenZen] = useState<boolean>(false);
  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);

  const [currentTopicId, setCurrentTopicId] = useState<string | undefined>();
  const [currentTopicName, setCurrentTopicName] = useState<string | undefined>();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedCycles = localStorage.getItem('zen_completed_cycles');
      if (savedCycles) setCompletedCycles(parseInt(savedCycles, 10));

      const savedMins = localStorage.getItem('zen_focused_mins_today');
      if (savedMins) setTotalFocusedMinutesToday(parseInt(savedMins, 10));

      const savedSound = localStorage.getItem('zen_ambient_sound') as AmbientSoundType;
      if (savedSound) setAmbientSound(savedSound);

      const savedVol = localStorage.getItem('zen_ambient_vol');
      if (savedVol) setAmbientVolume(parseFloat(savedVol));
    } catch {
      // Ignore
    }
  }, []);

  // Timer interval tick
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        if (preset === 'STOPWATCH') {
          // Count up
          setSecondsRemaining((prev) => prev + 1);
        } else {
          // Count down
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              handlePhaseCompleted();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, phase, preset, completedCycles]);

  // Audio sync
  useEffect(() => {
    if (isActive && !isPaused && ambientSound !== 'OFF') {
      ambientAudio.startAmbient(ambientSound, isMuted ? 0 : ambientVolume);
    } else {
      ambientAudio.stopAmbient();
    }
  }, [isActive, isPaused, ambientSound, isMuted, ambientVolume]);

  const handlePhaseCompleted = () => {
    const isFocusEnd = phase === 'FOCUS';
    ambientAudio.playChime(isFocusEnd);

    if (isFocusEnd) {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      try {
        localStorage.setItem('zen_completed_cycles', newCycles.toString());
      } catch {}

      const focusMinutesSpent = Math.round(totalSecondsInPhase / 60);
      setTotalFocusedMinutesToday((prev) => {
        const next = prev + focusMinutesSpent;
        try {
          localStorage.setItem('zen_focused_mins_today', next.toString());
        } catch {}
        return next;
      });

      // Long break every 4 cycles
      const nextPhase: CyclePhase = newCycles % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
      const dur = nextPhase === 'LONG_BREAK'
        ? PRESET_DURATIONS[preset].longBreak
        : PRESET_DURATIONS[preset].shortBreak;

      setPhase(nextPhase);
      setTotalSecondsInPhase(dur);
      setSecondsRemaining(dur);
    } else {
      // Break ended -> return to FOCUS
      const focusDur = PRESET_DURATIONS[preset].focus;
      setPhase('FOCUS');
      setTotalSecondsInPhase(focusDur);
      setSecondsRemaining(focusDur);
    }
  };

  const startFocus = (topicId?: string, topicName?: string) => {
    if (topicId) setCurrentTopicId(topicId);
    if (topicName) setCurrentTopicName(topicName);

    const dur = PRESET_DURATIONS[preset].focus;
    setPhase('FOCUS');
    setTotalSecondsInPhase(dur);
    setSecondsRemaining(dur);
    setIsActive(true);
    setIsPaused(false);
    setIsWidgetVisible(true);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    const dur = PRESET_DURATIONS[preset].focus;
    setTotalSecondsInPhase(dur);
    setSecondsRemaining(dur);
    ambientAudio.stopAmbient();
  };

  const skipPhase = () => {
    handlePhaseCompleted();
  };

  const changePreset = (newPreset: FocusPreset) => {
    setPreset(newPreset);
    const dur = PRESET_DURATIONS[newPreset].focus;
    setPhase('FOCUS');
    setTotalSecondsInPhase(dur);
    setSecondsRemaining(dur);
    setIsPaused(false);
  };

  const changeAmbientSound = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    try {
      localStorage.setItem('zen_ambient_sound', sound);
    } catch {}
  };

  const changeAmbientVolume = (vol: number) => {
    const val = Math.max(0, Math.min(1, vol));
    setAmbientVolume(val);
    ambientAudio.setVolume(val);
    try {
      localStorage.setItem('zen_ambient_vol', val.toString());
    } catch {}
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    ambientAudio.setMuted(next);
  };

  const toggleFullscreenZen = () => {
    setIsFullscreenZen((prev) => !prev);
  };

  const saveAndLogCurrentSession = async (): Promise<boolean> => {
    if (totalFocusedMinutesToday <= 0 && (!isActive || phase !== 'FOCUS')) {
      return false;
    }

    const elapsedSeconds = totalSecondsInPhase - secondsRemaining;
    const minutesToLog = Math.max(1, Math.round(elapsedSeconds / 60));

    const res = await recordFocusSessionAction({
      durationMinutes: minutesToLog,
      topicId: currentTopicId,
    });

    if (res.success) {
      resetTimer();
      setIsFullscreenZen(false);
      return true;
    }
    return false;
  };

  return (
    <FocusContext.Provider
      value={{
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
        currentTopicId,
        currentTopicName,
        totalFocusedMinutesToday,
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
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
