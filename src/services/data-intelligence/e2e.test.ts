import { describe, it, expect } from 'vitest';
import { aggregatePerformanceData } from './aggregator';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';

describe('Data Intelligence E2E (Raw DB Rows -> Allocator)', () => {
  const referenceDate = new Date('2026-10-05T12:00:00Z');
  const daysAgo = (days: number) => new Date(referenceDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  it('should adapt priorities based on changing raw database events', () => {
    // ESTADO A
    const topics = [
      { id: 'contabilidade', name: 'Contabilidade', subjects: { weight: 3 }, estimated_hours: 20 },
      { id: 'portugues', name: 'Português', subjects: { weight: 2 }, estimated_hours: 15 },
      { id: 'administrativo', name: 'Direito Adm', subjects: { weight: 1 }, estimated_hours: null } // No coverage estimate
    ];

    // Initial answers (All doing okay or bad but very old/previous)
    let answers = [
      ...Array(10).fill({ topic_id: 'contabilidade', is_correct: true, created_at: daysAgo(10) }),
      ...Array(10).fill({ topic_id: 'contabilidade', is_correct: false, created_at: daysAgo(10) }), // 50% previous
      // Simulate recent ones so it has a recent accuracy too, otherwise it's just 'previous'
      ...Array(5).fill({ topic_id: 'contabilidade', is_correct: true, created_at: daysAgo(3) }),
      ...Array(5).fill({ topic_id: 'contabilidade', is_correct: false, created_at: daysAgo(3) }), // 50% recent
      ...Array(20).fill({ topic_id: 'portugues', is_correct: true, created_at: daysAgo(2) }), // 100%
      ...Array(5).fill({ topic_id: 'administrativo', is_correct: true, created_at: daysAgo(8) }), // 100% but old
    ];

    let sessions = [
      { topic_id: 'contabilidade', duration_minutes: 600, created_at: daysAgo(4) }, // 10h
      { topic_id: 'portugues', duration_minutes: 900, created_at: daysAgo(5) }, // 15h
    ];

    let aggregated = aggregatePerformanceData({ topics, answers, sessions, referenceDate });
    let plan1 = generateAdaptiveSchedule({ availableHours: 12, topics: aggregated });

    const getHours = (id: string, plan: any[]) => plan.find(p => p.topicId === id)?.recommendedHours || 0;

    // Contabilidade should get more hours than Portugues due to worse accuracy and higher weight
    expect(getHours('contabilidade', plan1)).toBeGreaterThan(getHours('portugues', plan1));

    // ESTADO B: The disaster (Contabilidade gets worse, Admin stays the same, Portugues gets worse but still good)
    answers = [
      ...answers,
      // Contabilidade: answers 10 new questions, misses 8 (drops accuracy drastically and triggers reincidence)
      ...Array(2).fill({ topic_id: 'contabilidade', is_correct: true, created_at: daysAgo(1) }),
      ...Array(8).fill({ topic_id: 'contabilidade', is_correct: false, created_at: daysAgo(1) }),
    ];

    aggregated = aggregatePerformanceData({ topics, answers, sessions, referenceDate });
    let plan2 = generateAdaptiveSchedule({ availableHours: 12, topics: aggregated });

    // Contabilidade hours should max out (40% of 12h = 4.8h, which rounds to nearest block, 5h or 4.5h)
    const contHours2 = getHours('contabilidade', plan2);
    expect(contHours2).toBeGreaterThanOrEqual(4.5);
    const contRec = plan2.find(p => p.topicId === 'contabilidade');
    expect(contRec?.priorityLevel).toBe('CRITICAL');
    const reasons = contRec?.reasons.map(r => r.type) || [];
    expect(reasons).toContain('HIGH_ERROR_REINCIDENCE');
    expect(reasons).toContain('NEGATIVE_TREND');

    // ESTADO C: The Recovery
    // Advance reference date to simulate "next week"
    const futureDate = new Date(referenceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Add new answers: gets 10/10 correct
    answers = [
      ...answers,
      ...Array(10).fill({ topic_id: 'contabilidade', is_correct: true, created_at: futureDate.toISOString() })
    ];

    aggregated = aggregatePerformanceData({ topics, answers, sessions, referenceDate: futureDate });
    let plan3 = generateAdaptiveSchedule({ availableHours: 12, topics: aggregated });

    const contHours3 = getHours('contabilidade', plan3);
    // Priority and hours should drop significantly since the recent trend is massively positive (10/10)
    expect(contHours3).toBeLessThan(contHours2);
    const contRec3 = plan3.find(p => p.topicId === 'contabilidade');
    expect(contRec3?.priorityLevel).not.toBe('CRITICAL');
  });
});
