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
