import { createClient } from '@/lib/supabase/server';
import { AdaptiveLearningContext, InterventionHistoryItem, InterventionRecommendation } from '@/domain/adaptive-learning/types';
import { recommendIntervention } from '@/domain/adaptive-learning/engine';
import { TopicPerformanceData } from '@/domain/study-intelligence/types';

export async function getAdaptiveRecommendation(
  userId: string, 
  topicId: string, 
  spiPriority: number, 
  performance: TopicPerformanceData
): Promise<InterventionRecommendation> {
  const supabase = await createClient();

  // Fetch past interventions for this topic
  const { data: pastData, error } = await supabase
    .from('learning_interventions')
    .select('intervention_type, performance_before, performance_after, feeling, created_at')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
    .limit(10); // Look at last 10 interventions max

  if (error) {
    console.error('Failed to fetch interventions:', error);
  }

  const pastInterventions: InterventionHistoryItem[] = (pastData || []).map((row: any) => ({
    interventionType: row.intervention_type as any,
    performanceBefore: row.performance_before ? parseFloat(row.performance_before) : null,
    performanceAfter: row.performance_after ? parseFloat(row.performance_after) : null,
    feeling: row.feeling as any
  }));

  const context: AdaptiveLearningContext = {
    userId,
    topicId,
    topicName: performance.topicName,
    spiPriority,
    performance,
    pastInterventions
  };

  return recommendIntervention(context);
}
