import { TopicRecommendation, PriorityLevel, TopicPerformanceData } from './types';
import { calculateSPI } from './spi';

interface TopicWithSPI extends TopicPerformanceData {
  spiResult: ReturnType<typeof calculateSPI>;
}

export function allocateTime(availableHours: number, topics: TopicPerformanceData[]): TopicRecommendation[] {
  if (availableHours <= 0 || topics.length === 0) return [];

  // 1. Calculate SPI for all topics
  const scoredTopics: TopicWithSPI[] = topics.map(topic => ({
    ...topic,
    spiResult: calculateSPI(topic)
  })).filter(t => t.spiResult.spi > 0); // Ignore topics with 0 priority

  if (scoredTopics.length === 0) return [];

  const BLOCK_SIZE = 0.5; // 30 minutes minimum block
  const MAX_RATIO_PER_TOPIC = 0.4; // Max 40% of total time on a single topic
  const MAX_HOURS_PER_TOPIC = Math.max(
    availableHours * MAX_RATIO_PER_TOPIC,
    availableHours / scoredTopics.length, // Se houver poucas matérias, o limite se expande para preencher o tempo
    BLOCK_SIZE
  );

  // Sort by SPI descending
  scoredTopics.sort((a, b) => b.spiResult.spi - a.spiResult.spi);

  // 2. Proportional Allocation (using SPI squared to exaggerate differences)
  const totalWeight = scoredTopics.reduce((acc, t) => acc + Math.pow(t.spiResult.spi, 2), 0);
  
  let remainingHours = availableHours;
  const allocations = new Map<string, number>();

  // Initial distribution
  for (const topic of scoredTopics) {
    const weight = Math.pow(topic.spiResult.spi, 2);
    const rawProportion = (weight / totalWeight) * availableHours;
    
    // Round to nearest block size, cap at MAX_HOURS_PER_TOPIC
    let allocated = Math.round(rawProportion / BLOCK_SIZE) * BLOCK_SIZE;
    allocated = Math.min(allocated, MAX_HOURS_PER_TOPIC);
    
    // Ensure we don't exceed remaining total hours
    allocated = Math.min(allocated, remainingHours);
    
    allocations.set(topic.topicId, allocated);
    remainingHours -= allocated;
  }

  // 3. Distribute leftovers (due to rounding or caps) to highest SPI topics
  let previousRemaining = -1;
  while (remainingHours > 0 && remainingHours !== previousRemaining) {
    previousRemaining = remainingHours;
    for (const topic of scoredTopics) {
      if (remainingHours < BLOCK_SIZE) break;
      const current = allocations.get(topic.topicId) || 0;
      if (current + BLOCK_SIZE <= MAX_HOURS_PER_TOPIC) {
        allocations.set(topic.topicId, current + BLOCK_SIZE);
        remainingHours -= BLOCK_SIZE;
      }
    }
  }

  // Build the final recommendations
  const recommendations: TopicRecommendation[] = scoredTopics
    .filter(t => (allocations.get(t.topicId) || 0) > 0)
    .map(t => {
      const spi = t.spiResult.spi;
      let priorityLevel: PriorityLevel = 'LOW';
      if (spi >= 75) priorityLevel = 'CRITICAL';
      else if (spi >= 50) priorityLevel = 'HIGH';
      else if (spi >= 25) priorityLevel = 'MEDIUM';

      return {
        topicId: t.topicId,
        topicName: t.topicName,
        recommendedHours: allocations.get(t.topicId) || 0,
        priorityLevel,
        spi: t.spiResult.spi,
        reasons: t.spiResult.reasons,
        isInsufficientData: t.spiResult.isInsufficientData
      };
    });

  return recommendations;
}
