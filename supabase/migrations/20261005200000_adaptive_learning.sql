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
