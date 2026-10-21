import { describe, it, expect } from 'vitest';
import { generateAdaptiveSchedule } from './index';
import { TopicPerformanceData } from './types';

describe('Study Intelligence - Core Loop Integration', () => {
  it('should adapt schedule when performance drops (The Core Loop)', () => {
    // 1. Initial State: Doing okay across the board
    const topics: TopicPerformanceData[] = [
      {
        topicId: 'contabilidade', topicName: 'Contabilidade',
        recentAccuracy: 75, previousAccuracy: 75, questionsAnsweredRecent: 10,
        daysSinceLastReview: 2, recentErrorsCount: 0, examWeight: 2, hoursStudied: 10, estimatedHoursToCover: 20
      },
      {
        topicId: 'portugues', topicName: 'Português',
        recentAccuracy: 85, previousAccuracy: 85, questionsAnsweredRecent: 10,
        daysSinceLastReview: 1, recentErrorsCount: 0, examWeight: 2, hoursStudied: 15, estimatedHoursToCover: 20
      },
      {
        topicId: 'administrativo', topicName: 'Direito Administrativo',
        recentAccuracy: 72, previousAccuracy: 72, questionsAnsweredRecent: 10,
        daysSinceLastReview: 3, recentErrorsCount: 1, examWeight: 1, hoursStudied: 8, estimatedHoursToCover: 10
      }
    ];

    const initialPlan = generateAdaptiveSchedule({ availableHours: 12, topics });
    const initialContabilidade = initialPlan.find(t => t.topicId === 'contabilidade')!;
    
    // 2. The user studies and fails multiple questions in Contabilidade
    topics[0].previousAccuracy = 75;
    topics[0].recentAccuracy = 45; // Huge drop
    topics[0].recentErrorsCount = 5; // Reincidence spike

    const adaptedPlan = generateAdaptiveSchedule({ availableHours: 12, topics });
    const adaptedContabilidade = adaptedPlan.find(t => t.topicId === 'contabilidade')!;

    // Assert that the system reacted to the poor performance
    expect(adaptedContabilidade.spi).toBeGreaterThan(initialContabilidade.spi);
    
    // It should now flag the reasons explicitly
    const reasons = adaptedContabilidade.reasons.map(r => r.type);
    expect(reasons).toContain('LOW_ACCURACY');
    expect(reasons).toContain('NEGATIVE_TREND');
    expect(reasons).toContain('HIGH_ERROR_REINCIDENCE');

    // 3. User recovers (Performance improves)
    topics[0].previousAccuracy = 45;
    topics[0].recentAccuracy = 65; // Improved
    topics[0].recentErrorsCount = 1; // Errors dropped

    const recoveredPlan = generateAdaptiveSchedule({ availableHours: 12, topics });
    const recoveredContabilidade = recoveredPlan.find(t => t.topicId === 'contabilidade')!;

    // SPI should fall back down since the crisis passed (trend is no longer negative, reincidence is gone)
    expect(recoveredContabilidade.spi).toBeLessThan(adaptedContabilidade.spi);
  });
});
