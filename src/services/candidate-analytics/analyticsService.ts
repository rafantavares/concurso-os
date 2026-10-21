import { createClient } from '@/lib/supabase/server';
import { getAggregatedPerformanceData } from '../data-intelligence/performanceService';
import { calculateSPI } from '@/domain/study-intelligence/spi';
import { buildPreparationSummary, RawAnalyticsData } from '@/domain/candidate-analytics/engine';
import { CandidatePreparationSummary, SubjectProgress, Trend } from '@/domain/candidate-analytics/types';

export async function getCandidateAnalytics(userId: string, examId: string): Promise<CandidatePreparationSummary> {
  const supabase = await createClient();

  // 1. Fetch Plan Adherence (Last 30 days window context)
  // Look at study_plans and study_plan_items
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
  const dateStr = date30DaysAgo.toISOString().split('T')[0];

  const { data: planItems } = await supabase
    .from('study_plan_items')
    .select('duration_minutes, status')
    .eq('user_id', userId)
    .gte('planned_date', dateStr);

  let plannedMinutes = 0;
  let realizedMinutesFromPlan = 0; // We can also just sum study_sessions for total realized

  if (planItems) {
    for (const item of planItems) {
      plannedMinutes += item.duration_minutes;
      if (item.status === 'COMPLETED') {
        // Approximate realized by planned if linked, but actual realized is in sessions
      }
    }
  }

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('created_at', date30DaysAgo.toISOString());

  let realizedMinutes = 0;
  if (sessions) {
    for (const s of sessions) {
      realizedMinutes += (s.duration_minutes || 0);
    }
  }

  // 2. Fetch Performance & SPI (Grouped by Subject)
  // performanceService returns per-topic data. We aggregate up to Subject.
  const topicsPerf = await getAggregatedPerformanceData(userId, examId);
  
  // We need to fetch subjects to group properly
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('exam_id', examId);

  const subjectMap = new Map<string, any>();
  if (subjectsData) {
    for (const s of subjectsData) {
      subjectMap.set(s.id, {
        subjectId: s.id,
        subjectName: s.name,
        totalAcc: 0,
        accCount: 0,
        trendValues: [] as number[],
        hoursStudied: 0,
        questionsAnswered: 0,
        spiTotal: 0,
        spiCount: 0
      });
    }
  }

  // To group topics into subjects, we need the topic->subject mapping.
  // We can fetch it or just re-query topics.
  const { data: topicsData } = await supabase.from('topics').select('id, subject_id');
  const topicToSub = new Map<string, string>();
  if (topicsData) {
    for (const t of topicsData) {
      topicToSub.set(t.id, t.subject_id);
    }
  }

  for (const perf of topicsPerf) {
    const subId = topicToSub.get(perf.topicId);
    if (!subId) continue;
    
    const sData = subjectMap.get(subId);
    if (!sData) continue;

    if (perf.recentAccuracy !== null) {
      sData.totalAcc += perf.recentAccuracy;
      sData.accCount++;
    }
    
    if (perf.recentAccuracy !== null && perf.previousAccuracy !== null) {
      sData.trendValues.push(perf.recentAccuracy - perf.previousAccuracy);
    }

    sData.hoursStudied += perf.hoursStudied;
    sData.questionsAnswered += perf.questionsAnsweredRecent; // This is actually recent questions

    const spiObj = calculateSPI(perf);
    sData.spiTotal += spiObj.spi;
    sData.spiCount++;
  }

  const subjectsProgress: SubjectProgress[] = Array.from(subjectMap.values()).map(sData => {
    let trend: Trend = 'INSUFFICIENT_DATA';
    let trendValue = null;

    if (sData.trendValues.length > 0) {
      trendValue = sData.trendValues.reduce((a: number, b: number) => a + b, 0) / sData.trendValues.length;
      if (trendValue > 3) trend = 'IMPROVING';
      else if (trendValue < -3) trend = 'DECLINING';
      else trend = 'STABLE';
    }

    return {
      subjectId: sData.subjectId,
      subjectName: sData.subjectName,
      accuracy: sData.accCount > 0 ? sData.totalAcc / sData.accCount : null,
      trendValue,
      trend,
      coverage: null, // MVP: Add coverage when tracking is built
      hoursStudied: sData.hoursStudied,
      questionsAnswered: sData.questionsAnswered,
      spiAvg: sData.spiCount > 0 ? sData.spiTotal / sData.spiCount : 0
    };
  });

  // 3. Strategy Effectiveness
  // Group learning_interventions by intervention_type
  const { data: interventions } = await supabase
    .from('learning_interventions')
    .select('intervention_type, performance_before, performance_after')
    .eq('user_id', userId);

  const strategyMap = new Map<string, { totalDelta: number, count: number }>();
  if (interventions) {
    for (const inv of interventions) {
      if (inv.performance_before !== null && inv.performance_after !== null) {
        const delta = parseFloat(inv.performance_after as any) - parseFloat(inv.performance_before as any);
        const curr = strategyMap.get(inv.intervention_type) || { totalDelta: 0, count: 0 };
        curr.totalDelta += delta;
        curr.count += 1;
        strategyMap.set(inv.intervention_type, curr);
      }
    }
  }

  const strategyEffectiveness = Array.from(strategyMap.entries()).map(([type, stats]) => ({
    interventionType: type,
    sampleSize: stats.count,
    averageObservedImprovement: stats.count > 0 ? stats.totalDelta / stats.count : 0
  }));

  const rawData: RawAnalyticsData = {
    adherence: {
      plannedMinutes,
      realizedMinutes
    },
    subjects: subjectsProgress,
    strategyEffectiveness
  };

  return buildPreparationSummary(rawData);
}
