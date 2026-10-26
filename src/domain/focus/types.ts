export type FocusPreset = 'CLASSIC_25_5' | 'DEEP_50_10' | 'SPEED_15_3' | 'STOPWATCH';

export type CyclePhase = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export type AmbientSoundType = 'OFF' | 'BROWN_NOISE' | 'RAIN' | 'ALPHA_WAVES';

export interface FocusSettings {
  preset: FocusPreset;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  ambientSound: AmbientSoundType;
  ambientVolume: number; // 0 to 1
  soundAlertsEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface FocusState {
  isActive: boolean;
  isPaused: boolean;
  phase: CyclePhase;
  secondsRemaining: number;
  totalSecondsInPhase: number;
  completedCycles: number;
  totalFocusedMinutesToday: number;
  currentTopicId?: string;
  currentTopicName?: string;
}
