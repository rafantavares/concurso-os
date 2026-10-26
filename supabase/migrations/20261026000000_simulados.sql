-- Migration: 20261026000000_simulados.sql
-- Description: Adiciona tabela de Simulados e Provas Cronometradas

CREATE TABLE IF NOT EXISTS public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT DEFAULT 'GENERAL', -- 'GENERAL', 'SUBJECT', 'MISTAKES'
  subject_filter TEXT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  time_limit_minutes INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  score_percentage NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
  question_ids JSONB NOT NULL,
  answers_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for user query performance
CREATE INDEX IF NOT EXISTS idx_simulados_user_exam ON public.simulados(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_simulados_status ON public.simulados(status);
