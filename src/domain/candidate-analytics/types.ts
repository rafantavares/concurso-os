export type PreparationStatus = 
  | 'CALIBRANDO' 
  | 'CONSTRUINDO_BASE' 
  | 'EVOLUINDO' 
  | 'CONSOLIDANDO' 
  | 'ATENCAO';

export type Trend = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  accuracy: number | null;
  trendValue: number | null; // Delta in %
  trend: Trend;
  coverage: number | null; // % of estimated hours
  hoursStudied: number;
  questionsAnswered: number;
  spiAvg: number;
}

export interface Insight {
  type: string; // e.g., 'PERFORMANCE_IMPROVING', 'LOW_PLAN_ADHERENCE', 'HIGH_EFFORT_LOW_PROGRESS'
  context: string;
}

export interface CandidatePreparationSummary {
  status: PreparationStatus;
  globalAccuracy: number | null;
  globalCoverage: number | null;
  adherencePercentage: number | null;
  hoursPlanned: number;
  hoursRealized: number;
  questionsAnswered: number;
  
  subjects: SubjectProgress[];
  insights: Insight[];
  
  // Adaptive Learning effectiveness metrics
  strategyEffectiveness: Array<{
    interventionType: string;
    sampleSize: number;
    averageObservedImprovement: number;
  }>;
}
