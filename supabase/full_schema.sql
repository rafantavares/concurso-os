-- Migration: initial_schema

-- 1. Users Profile
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  hours_per_week numeric,
  available_days text[], -- array of days like 'Mon', 'Tue'
  session_duration_preference integer, -- in minutes
  routine_restrictions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Exams
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  institution text,
  board text,
  status text,
  exam_date date,
  created_at timestamptz DEFAULT now()
);

-- Exams are public to view, only admin can edit (for now, we'll just allow authenticated users to view)
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exams are viewable by everyone" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Exams can be inserted by authenticated" ON public.exams FOR INSERT TO authenticated WITH CHECK (true);

-- User Exams
CREATE TABLE public.user_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exam_id)
);

ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own user_exams" ON public.user_exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own user_exams" ON public.user_exams FOR ALL USING (auth.uid() = user_id);

-- 3. Subjects
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subjects can be inserted by authenticated" ON public.subjects FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Topics
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Topics can be inserted by authenticated" ON public.topics FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Study Sessions
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('THEORY', 'REVIEW', 'EXERCISES', 'SIMULATED')),
  notes text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. User Answers
CREATE TABLE public.user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  question_id text,
  is_correct boolean NOT NULL,
  time_spent_seconds integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own answers" ON public.user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ENFORCING IMMUTABILITY FOR EVENT TABLES
-- RLS already blocks UPDATE and DELETE since we only created SELECT and INSERT policies.
-- However, we explicitly revoke the privileges from the authenticated role to guarantee 
-- that the historical events cannot be tampered with by the user.
REVOKE UPDATE, DELETE ON public.study_sessions FROM authenticated;
REVOKE UPDATE, DELETE ON public.user_answers FROM authenticated;

-- Table: exam_documents
CREATE TABLE public.exam_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  original_name text NOT NULL,
  size_bytes bigint NOT NULL,
  status text NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED', 'PROCESSING', 'REVIEW_REQUIRED', 'CONFIRMED', 'FAILED')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: exam_document_drafts
CREATE TABLE public.exam_document_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.exam_documents(id) ON DELETE CASCADE UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS policies
ALTER TABLE public.exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_document_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own exam documents"
  ON public.exam_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own document drafts"
  ON public.exam_document_drafts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add estimated_hours to topics if not exists (we mocked it before)
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS estimated_hours_to_cover numeric DEFAULT NULL;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS estimated_hours_source text DEFAULT NULL CHECK (estimated_hours_source IN ('AUTO', 'MANUAL', 'NONE'));
-- Migration for Phase 8: Adaptive Study Experience
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS planned_duration_minutes integer;
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS feeling text CHECK (feeling IN ('EASY', 'NORMAL', 'HARD'));
ALTER TABLE public.study_sessions ADD COLUMN IF NOT EXISTS notes text;
-- Migration for Phase 9: Hardening - Atomic Study Session Insertion
CREATE OR REPLACE FUNCTION register_study_session_with_answers(
    p_user_id uuid,
    p_topic_id uuid,
    p_duration integer,
    p_planned integer,
    p_type text,
    p_feeling text,
    p_total_q integer,
    p_correct_q integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Inserir a sessão de estudo
    INSERT INTO public.study_sessions (
        user_id,
        topic_id,
        duration_minutes,
        planned_duration_minutes,
        session_type,
        feeling
    ) VALUES (
        p_user_id,
        p_topic_id,
        p_duration,
        p_planned,
        p_type,
        p_feeling
    );

    -- 2. Inserir as questões individuais se existirem
    IF p_total_q > 0 THEN
        -- Evita loops e faz insert dinâmico na tabela
        INSERT INTO public.user_answers (user_id, topic_id, is_correct)
        SELECT 
            p_user_id, 
            p_topic_id, 
            (s.id <= p_correct_q) AS is_correct
        FROM generate_series(1, p_total_q) AS s(id);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to register study session and answers: %', SQLERRM;
END;
$$;
-- Migration for Phase 10: AI Learning Layer
CREATE TABLE public.ai_flashcards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    front_text text NOT NULL,
    back_text text NOT NULL,
    origin text NOT NULL, -- e.g., 'ERROR_ANALYSIS', 'LOW_PERFORMANCE'
    difficulty text, -- e.g., 'HARD', 'NORMAL'
    context_reason text, -- Why it was generated
    created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.ai_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcards"
    ON public.ai_flashcards
    FOR ALL
    USING (auth.uid() = user_id);

-- Index for fast retrieval by topic/user
CREATE INDEX idx_ai_flashcards_user_topic ON public.ai_flashcards(user_id, topic_id);
-- Migration for Phase 11: Quest Engine

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    statement text NOT NULL,
    options jsonb NOT NULL,
    correct_option text NOT NULL,
    difficulty text CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    source_type text DEFAULT 'OFFICIAL' CHECK (source_type IN ('OFFICIAL', 'USER_CREATED', 'AI_GENERATED', 'IMPORTED')),
    origin text,
    year integer,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.user_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    selected_option text,
    is_correct boolean NOT NULL,
    duration_seconds integer,
    mode text DEFAULT 'PRACTICE',
    created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for questions (public read for everyone, since they are global resources)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Users can insert AI generated questions" ON public.questions FOR INSERT WITH CHECK (source_type IN ('USER_CREATED', 'AI_GENERATED'));

-- RLS for user_attempts (private to user)
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their attempts" ON public.user_attempts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_attempts_user_topic ON public.user_attempts(user_id, topic_id);
CREATE INDEX idx_user_attempts_question ON public.user_attempts(question_id);
-- Migration for Phase 12: Adaptive Learning Engine

CREATE TABLE public.learning_interventions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    
    intervention_type text NOT NULL, -- 'QUESTIONS', 'REVIEW', 'ERROR_ANALYSIS', 'GUIDED_REVIEW', 'FLASHCARDS', 'THEORY'
    reason text,
    
    planned_duration_minutes integer,
    realized_duration_minutes integer,
    feeling text CHECK (feeling IN ('EASY', 'NORMAL', 'HARD')),
    
    performance_before numeric, -- Accuracy % before intervention
    performance_after numeric,  -- Accuracy % after intervention (updated asynchronously or upon next check)
    
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.learning_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own learning interventions" 
    ON public.learning_interventions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_learning_interventions_user_topic ON public.learning_interventions(user_id, topic_id);
-- Make question_id nullable to support offline bulk registrations where the specific question is unknown
ALTER TABLE public.user_attempts ALTER COLUMN question_id DROP NOT NULL;
-- Update RPC to insert into user_attempts instead of user_answers

CREATE OR REPLACE FUNCTION register_study_session_with_answers(
    p_user_id uuid,
    p_topic_id uuid,
    p_duration integer,
    p_planned integer,
    p_type text,
    p_feeling text,
    p_total_q integer,
    p_correct_q integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Inserir a sessão de estudo
    INSERT INTO public.study_sessions (
        user_id,
        topic_id,
        duration_minutes,
        planned_duration_minutes,
        session_type,
        feeling
    ) VALUES (
        p_user_id,
        p_topic_id,
        p_duration,
        p_planned,
        p_type,
        p_feeling
    );

    -- 2. Inserir as questões individuais se existirem
    IF p_total_q > 0 THEN
        -- Evita loops e faz insert dinâmico na tabela
        INSERT INTO public.user_attempts (user_id, topic_id, is_correct)
        SELECT 
            p_user_id, 
            p_topic_id, 
            (s.id <= p_correct_q) AS is_correct
        FROM generate_series(1, p_total_q) AS s(id);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to register study session and answers: %', SQLERRM;
END;
$$;
-- Phase 14: Adaptive Scheduler 2.0

CREATE TYPE plan_status AS ENUM ('ACTIVE', 'SUPERSEDED', 'COMPLETED');
CREATE TYPE plan_item_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'SKIPPED', 'POSTPONED');

CREATE TABLE public.study_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    version integer NOT NULL DEFAULT 1,
    status plan_status NOT NULL DEFAULT 'ACTIVE',
    start_date date NOT NULL,
    end_date date NOT NULL,
    available_minutes integer NOT NULL,
    reason_for_change text,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.study_plan_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id uuid NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    
    planned_date date NOT NULL,
    duration_minutes integer NOT NULL,
    intervention_type text NOT NULL,
    priority_level text NOT NULL,
    
    status plan_item_status NOT NULL DEFAULT 'PLANNED',
    completed_session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
    
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own plans" 
    ON public.study_plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own plan items" 
    ON public.study_plan_items FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_study_plans_active ON public.study_plans(user_id, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_study_plan_items_date ON public.study_plan_items(user_id, planned_date);
-- Phase 18: Production Beta - Feedback System

CREATE TYPE feedback_type AS ENUM ('BUG', 'SUGGESTION', 'DIFFICULTY', 'OTHER');

CREATE TABLE public.feedbacks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type feedback_type NOT NULL,
    description text NOT NULL,
    context text,
    status text DEFAULT 'OPEN',
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback" 
    ON public.feedbacks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
    ON public.feedbacks FOR SELECT 
    USING (auth.uid() = user_id);
