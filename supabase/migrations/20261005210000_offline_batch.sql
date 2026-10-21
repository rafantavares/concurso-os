-- Make question_id nullable to support offline bulk registrations where the specific question is unknown
ALTER TABLE public.user_attempts ALTER COLUMN question_id DROP NOT NULL;
