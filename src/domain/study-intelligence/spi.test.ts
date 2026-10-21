import { describe, it, expect } from 'vitest';
import { calculateSPI } from './spi';
import { TopicPerformanceData } from './types';

describe('Study Priority Index (SPI) Engine', () => {
  const baseTopic: TopicPerformanceData = {
    topicId: 't1',
    topicName: 'Base',
    recentAccuracy: null,
    previousAccuracy: null,
    questionsAnsweredRecent: 0,
    daysSinceLastReview: null,
    recentErrorsCount: 0,
    examWeight: 1,
    hoursStudied: 0,
    estimatedHoursToCover: 10
  };

  it('should increase SPI significantly when accuracy is very low (Performance)', () => {
    const result = calculateSPI({
      ...baseTopic,
      recentAccuracy: 30, // Way below 85 target
      questionsAnsweredRecent: 10,
      hoursStudied: 5
    });
    expect(result.spi).toBeGreaterThan(0);
    expect(result.reasons).toContainEqual(
      expect.objectContaining({ type: 'LOW_ACCURACY', value: 30 })
    );
  });

  it('should not penalize accuracy if less than 5 questions answered', () => {
    const result = calculateSPI({
      ...baseTopic,
      recentAccuracy: 0,
      questionsAnsweredRecent: 2, // Too few to trust
    });
    // Coverage will still add points, but performance won't
    const reasons = result.reasons.map(r => r.type);
    expect(reasons).not.toContain('LOW_ACCURACY');
  });

  it('should detect negative trend and penalize (Trend)', () => {
    const result = calculateSPI({
      ...baseTopic,
      recentAccuracy: 60,
      previousAccuracy: 80,
      questionsAnsweredRecent: 10,
      hoursStudied: 5
    });
    expect(result.reasons).toContainEqual(
      expect.objectContaining({ type: 'NEGATIVE_TREND', value: -20 })
    );
  });

  it('should increase SPI based on recency decay (Recency)', () => {
    const result = calculateSPI({
      ...baseTopic,
      daysSinceLastReview: 20
    });
    expect(result.reasons).toContainEqual(
      expect.objectContaining({ type: 'TIME_SINCE_REVIEW', value: 20 })
    );
  });

  it('should punish repeated errors heavily (Reincidence)', () => {
    const result = calculateSPI({
      ...baseTopic,
      recentErrorsCount: 5
    });
    expect(result.reasons).toContainEqual(
      expect.objectContaining({ type: 'HIGH_ERROR_REINCIDENCE', value: 5 })
    );
  });

  it('should prioritize topics with high coverage need (Coverage)', () => {
    const result = calculateSPI({
      ...baseTopic,
      hoursStudied: 1,
      estimatedHoursToCover: 20 // 5% coverage
    });
    expect(result.reasons).toContainEqual(
      expect.objectContaining({ type: 'LOW_COVERAGE', value: 5 })
    );
  });
});
