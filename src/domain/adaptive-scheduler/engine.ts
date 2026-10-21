import { ReplanRequest, StudyPlan, StudyPlanItem } from './types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateAdaptivePlan(request: ReplanRequest): Omit<StudyPlan, 'id'> {
  const { availableMinutes, startDate, endDate, topicsWithPerformance, reason } = request;
  
  // Sort topics by SPI descending (Highest priority first)
  const sortedTopics = [...topicsWithPerformance].sort((a, b) => b.spi - a.spi);

  const daysDifference = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const minutesPerDay = Math.floor(availableMinutes / daysDifference);

  const items: StudyPlanItem[] = [];
  
  // Very simplified distribution:
  // Allocate BLOCK_SIZE (e.g., 60 mins) per critical topic per day, until we run out of time.
  const BLOCK_SIZE = 60;
  
  for (let i = 0; i < daysDifference; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = formatDate(currentDate);
    
    let dailyAllocated = 0;
    
    // Distribute time to the most critical topics for this day
    for (const topic of sortedTopics) {
      if (dailyAllocated + BLOCK_SIZE <= minutesPerDay) {
        
        // Map SPI to priority level text
        let priority = 'LOW';
        if (topic.spi >= 80) priority = 'CRITICAL';
        else if (topic.spi >= 50) priority = 'HIGH';
        else if (topic.spi >= 30) priority = 'MEDIUM';

        items.push({
          topicId: topic.perf.topicId,
          topicName: topic.perf.topicName,
          plannedDate: dateStr,
          durationMinutes: BLOCK_SIZE,
          interventionType: topic.recommendedIntervention,
          priorityLevel: priority,
          status: 'PLANNED'
        });
        dailyAllocated += BLOCK_SIZE;
      }
    }
  }

  const version = request.currentPlan ? request.currentPlan.version + 1 : 1;

  return {
    userId: request.currentPlan?.userId || '', // To be filled by the service
    examId: request.currentPlan?.examId || '', // To be filled by the service
    version,
    status: 'ACTIVE',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    availableMinutes,
    reasonForChange: reason,
    items
  };
}
