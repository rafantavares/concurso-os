export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ExplanationReasonType = 
  | 'LOW_ACCURACY' 
  | 'HIGH_ERROR_REINCIDENCE' 
  | 'TIME_SINCE_REVIEW' 
  | 'HIGH_EXAM_RELEVANCE' 
  | 'LOW_COVERAGE' 
  | 'NEGATIVE_TREND';

export interface ExplanationReason {
  type: ExplanationReasonType;
  value: string | number | null;
  context: string;
}

export interface TopicRecommendation {
  topicId: string;
  topicName?: string;
  recommendedHours: number;
  priorityLevel: PriorityLevel;
  spi: number;
  reasons: ExplanationReason[];
  isInsufficientData: boolean;
}

export interface TopicPerformanceData {
  topicId: string;
  topicName: string;
  // Performance
  recentAccuracy: number | null; // 0 to 100
  previousAccuracy: number | null; // For trend calculation
  questionsAnsweredRecent: number;
  
  // Recency
  daysSinceLastReview: number | null;
  
  // Reincidence
  recentErrorsCount: number;
  
  // Relevance
  examWeight: number; // e.g., 1 to 5
  
  // Coverage
  hoursStudied: number;
  estimatedHoursToCover: number | null; // null = coverage unknown
}

export interface StudyIntelligenceInput {
  availableHours: number;
  topics: TopicPerformanceData[];
}
