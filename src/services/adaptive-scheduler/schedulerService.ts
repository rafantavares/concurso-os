import { createClient } from '@/lib/supabase/server';
import { getAggregatedPerformanceData } from '../data-intelligence/performanceService';
import { getAdaptiveRecommendation } from '../adaptive-learning/adaptiveService';
import { generateAdaptivePlan } from '@/domain/adaptive-scheduler/engine';
import { calculateSPI } from '@/domain/study-intelligence/spi';
import { ReplanRequest, StudyPlan } from '@/domain/adaptive-scheduler/types';

export async function replanSchedule(userId: string, examId: string, availableMinutesPerWeek: number, reason: string): Promise<StudyPlan> {
  const supabase = await createClient();

  // 1. Mark existing active plan as SUPERSEDED
  const { data: currentPlans } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .eq('status', 'ACTIVE');
  
  const currentPlan = currentPlans && currentPlans.length > 0 ? currentPlans[0] : null;

  if (currentPlan) {
    await supabase.from('study_plans').update({ status: 'SUPERSEDED' }).eq('id', currentPlan.id);
  }

  // 2. Fetch Topics and SPI
  const topicsPerf = await getAggregatedPerformanceData(userId, examId);
  const topicsWithContext = [];

  for (const perf of topicsPerf) {
    const spiObj = calculateSPI(perf);
    const spi = spiObj.spi;
    const rec = await getAdaptiveRecommendation(userId, perf.topicId, spi, perf);
    
    topicsWithContext.push({
      perf,
      spi,
      recommendedIntervention: rec.recommendedType
    });
  }

  // 3. Generate New Plan
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7); // Schedule for the next 7 days

  const request: ReplanRequest = {
    currentPlan: currentPlan ? { ...currentPlan, version: currentPlan.version } : undefined,
    availableMinutes: availableMinutesPerWeek,
    startDate,
    endDate,
    topicsWithPerformance: topicsWithContext,
    reason
  };

  const newPlan = generateAdaptivePlan(request);
  newPlan.userId = userId;
  newPlan.examId = examId;

  // 4. Save New Plan and Items
  const { data: savedPlan, error: planError } = await supabase
    .from('study_plans')
    .insert({
      user_id: newPlan.userId,
      exam_id: newPlan.examId,
      version: newPlan.version,
      status: newPlan.status,
      start_date: newPlan.startDate,
      end_date: newPlan.endDate,
      available_minutes: newPlan.availableMinutes,
      weekly_target_hours: Math.round((newPlan.availableMinutes / 60) * 10) / 10,
      reason_for_change: newPlan.reasonForChange
    })
    .select('id')
    .single();

  if (planError || !savedPlan) {
    throw new Error(`Failed to save study plan: ${planError?.message}`);
  }

  if (newPlan.items && newPlan.items.length > 0) {
    const itemsToInsert = newPlan.items.map(item => ({
      plan_id: savedPlan.id,
      user_id: userId,
      topic_id: item.topicId,
      planned_date: item.plannedDate,
      duration_minutes: item.durationMinutes,
      intervention_type: item.interventionType,
      priority_level: item.priorityLevel,
      status: item.status
    }));

    await supabase.from('study_plan_items').insert(itemsToInsert);
  }

  return { ...newPlan, id: savedPlan.id };
}

export async function getActivePlan(userId: string, examId: string): Promise<StudyPlan | null> {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!plans || plans.length === 0) return null;
  const plan = plans[0];

  const { data: items } = await supabase
    .from('study_plan_items')
    .select('id, topic_id, planned_date, duration_minutes, intervention_type, priority_level, status, topics(name)')
    .eq('plan_id', plan.id)
    .order('planned_date', { ascending: true });

  const mappedItems = (items || []).map((it: any) => ({
    id: it.id,
    planId: plan.id,
    topicId: it.topic_id,
    topicName: it.topics?.name,
    plannedDate: it.planned_date,
    durationMinutes: it.duration_minutes,
    interventionType: it.intervention_type,
    priorityLevel: it.priority_level,
    status: it.status
  }));

  return {
    id: plan.id,
    userId: plan.user_id,
    examId: plan.exam_id,
    version: plan.version,
    status: plan.status,
    startDate: plan.start_date,
    endDate: plan.end_date,
    availableMinutes: plan.available_minutes,
    reasonForChange: plan.reason_for_change,
    items: mappedItems
  };
}
