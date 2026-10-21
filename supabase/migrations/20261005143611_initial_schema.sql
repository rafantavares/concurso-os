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

