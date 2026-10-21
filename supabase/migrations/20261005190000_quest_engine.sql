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
