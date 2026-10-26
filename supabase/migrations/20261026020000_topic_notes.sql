-- Migration: Topic Notes for Study Room
CREATE TABLE IF NOT EXISTS topic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, topic_id)
);

ALTER TABLE topic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own topic notes"
  ON topic_notes
  FOR ALL
  USING (auth.uid() = user_id);
