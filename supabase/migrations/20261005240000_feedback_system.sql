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
