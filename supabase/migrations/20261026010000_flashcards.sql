-- Migration: 20261026010000_flashcards.sql
-- Description: Adiciona tabela de Flashcards Inteligentes com repetição espaçada SM-2

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  category TEXT DEFAULT 'GERAL', -- 'GERAL', 'LEI_SECA', 'JURISPRUDENCIA', 'MNEMONICO', 'CADERNO_ERROS'
  repetition_count INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  ease_factor NUMERIC DEFAULT 2.5,
  due_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'NEW', -- 'NEW', 'LEARNING', 'REVIEW', 'MASTERED'
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_due ON public.flashcards(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON public.flashcards(topic_id);
