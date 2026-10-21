import { TopicPerformanceData } from '../study-intelligence/types';
import { InterventionType } from '../adaptive-learning/types';

export type PlanStatus = 'ACTIVE' | 'SUPERSEDED' | 'COMPLETED';
export type PlanItemStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'SKIPPED' | 'POSTPONED';

export interface StudyPlan {
  id?: string;
  userId: string;
  examId: string;
  version: number;
  status: PlanStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  availableMinutes: number;
  reasonForChange?: string;
  items?: StudyPlanItem[];
}

export interface StudyPlanItem {
  id?: string;
  planId?: string;
  topicId: string;
  topicName?: string;
  plannedDate: string; // YYYY-MM-DD
  durationMinutes: number;
  interventionType: InterventionType;
  priorityLevel: string;
  status: PlanItemStatus;
  completedSessionId?: string;
}

export interface ReplanRequest {
  currentPlan?: StudyPlan;
  availableMinutes: number;
  startDate: Date;
  endDate: Date;
  topicsWithPerformance: Array<{
    perf: TopicPerformanceData;
    spi: number;
    recommendedIntervention: InterventionType;
  }>;
  reason: string;
}
