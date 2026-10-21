import { createClient } from '@/lib/supabase/server';
import { aggregatePerformanceData } from './aggregator';
import { TopicPerformanceData } from '@/domain/study-intelligence/types';

/**
 * Fetches events from Supabase and aggregates them into TopicPerformanceData
 * without leaking domain math into SQL.
 */
export async function getAggregatedPerformanceData(userId: string, examId: string): Promise<TopicPerformanceData[]> {
  const supabase = await createClient();

  // 1. Fetch Topics and Subjects (for examWeight)
  const { data: topicsData, error: topicsError } = await supabase
    .from('topics')
    .select(`
      id,
      name,
      subjects!inner (
        id,
        weight,
        exam_id
      )
    `)
    .eq('subjects.exam_id', examId);

  if (topicsError) throw new Error(`Failed to fetch topics: ${topicsError.message}`);

  // 2. Fetch User Attempts (New Source of Truth)
  const { data: answersData, error: answersError } = await supabase
    .from('user_attempts')
    .select('topic_id, is_correct, created_at, questions(source_type)')
    .eq('user_id', userId)
    .in('topic_id', topicsData.map((t: any) => t.id));

  if (answersError) throw new Error(`Failed to fetch answers: ${answersError.message}`);

  // 3. Fetch Study Sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('study_sessions')
    .select('topic_id, duration_minutes, created_at')
    .eq('user_id', userId)
    .in('topic_id', topicsData.map((t: any) => t.id));

  if (sessionsError) throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);

  // 4. Transform raw data into the format the aggregator expects
  const rawTopics = topicsData.map((t: any) => {
    const subj: any = t.subjects;
    const weight = Array.isArray(subj) ? subj[0]?.weight : subj?.weight;
    return {
      id: t.id,
      name: t.name,
      subjects: { weight: weight || 1 },
      estimated_hours: null
    };
  });

  // 5. Aggregate
  return aggregatePerformanceData({
    topics: rawTopics,
    answers: answersData,
    sessions: sessionsData
  });
}
