import { describe, it, expect } from 'vitest';
import { allocateTime } from './allocator';
import { TopicPerformanceData } from './types';

describe('Time Allocator', () => {
  const createTopic = (id: string, weight: number, acc: number, revDays: number): TopicPerformanceData => ({
    topicId: id,
    topicName: id,
    recentAccuracy: acc,
    previousAccuracy: acc,
    questionsAnsweredRecent: 10,
    daysSinceLastReview: revDays,
    recentErrorsCount: acc < 50 ? 4 : 0,
    examWeight: weight,
    hoursStudied: 5,
    estimatedHoursToCover: 10
  });

  it('should distribute hours proportionally but respect caps', () => {
    const topics = [
      createTopic('T1', 5, 20, 30), // Terrible performance, Max weight, very old = CRITICAL
      createTopic('T2', 1, 90, 1),  // Good performance, Low weight (Low SPI)
      createTopic('T3', 2, 70, 20), // Needs review (Medium SPI)
    ];

    const availableHours = 10;
    const recommendations = allocateTime(availableHours, topics);

    // Ensure sum of hours equals available hours exactly
    const totalAllocated = recommendations.reduce((acc, r) => acc + r.recommendedHours, 0);
    expect(totalAllocated).toBe(availableHours);

    // Ensure caps are respected (max 40% of 10h = 4h per topic)
    for (const rec of recommendations) {
      expect(rec.recommendedHours).toBeLessThanOrEqual(4);
      expect(rec.recommendedHours % 0.5).toBe(0); // blocks of 0.5
    }

    // T1 should have highest priority
    const t1 = recommendations.find(r => r.topicId === 'T1');
    const t2 = recommendations.find(r => r.topicId === 'T2');
    
    expect(t1?.priorityLevel).toBe('CRITICAL');
    expect(t1!.recommendedHours).toBeGreaterThan(t2?.recommendedHours || 0);
  });

  it('should handle zero hours gracefully', () => {
    const recs = allocateTime(0, [createTopic('T1', 1, 50, 5)]);
    expect(recs.length).toBe(0);
  });
});
