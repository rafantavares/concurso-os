export type SimuladoMode = 'GENERAL' | 'SUBJECT' | 'MISTAKES';

export type SimuladoStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface SimuladoConfig {
  title: string;
  mode: SimuladoMode;
  subjectId?: string;
  totalQuestions: number;
  timeLimitMinutes: number | null; // null for untimed
}

export interface SimuladoAnswer {
  questionId: string;
  selectedOption: string | null;
  isCorrect?: boolean | null;
  isMarkedForReview: boolean;
  eliminatedOptions?: string[]; // A, B, C, D, E crossed out by candidate
  timeSpentSeconds: number;
}

export interface SimuladoRecord {
  id: string;
  user_id: string;
  exam_id: string;
  title: string;
  mode: SimuladoMode;
  subject_filter: string | null;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  time_limit_minutes: number | null;
  time_spent_seconds: number;
  score_percentage: number;
  status: SimuladoStatus;
  question_ids: string[];
  answers_payload: Record<string, SimuladoAnswer>;
  created_at: string;
  completed_at: string | null;
}

export interface QuestionWithTopic {
  id: string;
  exam_id: string;
  subject_id: string;
  topic_id: string;
  statement: string;
  options: string[];
  correct_option: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  source_type: string;
  year: number;
  topic_name?: string;
  subject_name?: string;
}

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  total: number;
  correct: number;
  percentage: number;
}
