-- Migration for Phase 8: Adaptive Study Experience
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS planned_duration_minutes integer;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS feeling text CHECK (feeling IN ('EASY', 'NORMAL', 'HARD'));
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS notes text;
