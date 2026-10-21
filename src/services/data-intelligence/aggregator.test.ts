import { describe, it, expect } from 'vitest';
import { aggregatePerformanceData } from './aggregator';

describe('Data Aggregator', () => {
  const referenceDate = new Date('2026-10-05T12:00:00Z');

  // Helpers to generate dates
  const daysAgo = (days: number) => new Date(referenceDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  it('should correctly calculate recent and previous accuracy windows', () => {
    const topics = [{ id: 't1', name: 'Topic 1', subjects: { weight: 2 } }];
    
    const answers = [
      // Recent (last 7 days)
      { topic_id: 't1', is_correct: true, created_at: daysAgo(2) },
      { topic_id: 't1', is_correct: false, created_at: daysAgo(3) },
      // Previous (7 to 14 days)
      { topic_id: 't1', is_correct: true, created_at: daysAgo(10) },
      { topic_id: 't1', is_correct: true, created_at: daysAgo(11) },
      // Too old (ignored for performance trend)
      { topic_id: 't1', is_correct: false, created_at: daysAgo(20) },
    ];

    const result = aggregatePerformanceData({ topics, answers, sessions: [], referenceDate });

    expect(result).toHaveLength(1);
    const data = result[0];
    
    // Recent: 1 correct, 1 wrong = 50%
    expect(data.recentAccuracy).toBe(50);
    // Previous: 2 correct, 0 wrong = 100%
    expect(data.previousAccuracy).toBe(100);
    expect(data.questionsAnsweredRecent).toBe(2);
    expect(data.examWeight).toBe(2);
  });

  it('should return null accuracy if not enough data in the window', () => {
    const topics = [{ id: 't1', name: 'Topic 1' }];
    const result = aggregatePerformanceData({ topics, answers: [], sessions: [], referenceDate });
    expect(result[0].recentAccuracy).toBeNull();
    expect(result[0].previousAccuracy).toBeNull();
  });

  it('should calculate coverage correctly, ignoring null estimates', () => {
    const topics = [{ id: 't1', name: 'Topic 1', estimated_hours: null }];
    const sessions = [
      { topic_id: 't1', duration_minutes: 120, created_at: daysAgo(1) },
      { topic_id: 't1', duration_minutes: 60, created_at: daysAgo(2) }
    ];

    const result = aggregatePerformanceData({ topics, answers: [], sessions, referenceDate });
    expect(result[0].hoursStudied).toBe(3); // 180 mins = 3 hours
    expect(result[0].estimatedHoursToCover).toBeNull();
  });

  it('should calculate recency based on the latest interaction (session or answer)', () => {
    const topics = [{ id: 't1', name: 'Topic 1' }];
    
    // Answer was 10 days ago
    const answers = [{ topic_id: 't1', is_correct: true, created_at: daysAgo(10) }];
    // Session was 2 days ago
    const sessions = [{ topic_id: 't1', duration_minutes: 60, created_at: daysAgo(2) }];

    const result = aggregatePerformanceData({ topics, answers, sessions, referenceDate });
    
    expect(result[0].daysSinceLastReview).toBe(2);
  });
});
