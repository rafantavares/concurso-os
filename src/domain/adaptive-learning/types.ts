import { TopicPerformanceData } from '../study-intelligence/types';

export type InterventionType = 
  | 'THEORY'
  | 'QUESTIONS'
  | 'REVIEW'
  | 'GUIDED_REVIEW'
  | 'ERROR_ANALYSIS'
  | 'FLASHCARDS'
  | 'MIXED_QUESTIONS';

export type ConfidenceLevel = 
  | 'INSUFFICIENT_EVIDENCE'
  | 'EARLY_SIGNAL'
  | 'MODERATE_EVIDENCE'
  | 'STRONG_EVIDENCE';

export interface InterventionHistoryItem {
  interventionType: InterventionType;
  performanceBefore: number | null;
  performanceAfter: number | null;
  feeling: 'EASY' | 'NORMAL' | 'HARD' | null;
}

export interface AdaptiveLearningContext {
  userId: string;
  topicId: string;
  topicName: string;
  spiPriority: number;
  performance: TopicPerformanceData; // from Study Intelligence
  pastInterventions: InterventionHistoryItem[]; // ordered newest to oldest
}

export interface InterventionRecommendation {
  recommendedType: InterventionType;
  reason: string;
  confidence: ConfidenceLevel;
}
