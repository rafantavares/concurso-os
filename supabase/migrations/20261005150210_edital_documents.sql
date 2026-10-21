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
