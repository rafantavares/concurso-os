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
