import { ReviewRating } from './sm2';

export type FlashcardCategory = 'GERAL' | 'LEI_SECA' | 'JURISPRUDENCIA' | 'MNEMONICO' | 'CADERNO_ERROS';

export type FlashcardStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export interface Flashcard {
  id: string;
  user_id: string;
  exam_id: string;
  topic_id: string;
  front: string;
  back: string;
  category: FlashcardCategory;
  repetition_count: number;
  interval_days: number;
  ease_factor: number;
  due_date: string; // YYYY-MM-DD
  status: FlashcardStatus;
  last_reviewed_at: string | null;
  created_at: string;
  topic_name?: string;
  subject_name?: string;
}

export interface DeckSummary {
  subjectId: string;
  subjectName: string;
  totalCards: number;
  dueToday: number;
  newCards: number;
  learningCards: number;
  masteredCards: number;
}
