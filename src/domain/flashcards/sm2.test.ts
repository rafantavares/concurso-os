import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('calculateSM2 Algorithm', () => {
  const baseDate = new Date('2026-10-26T12:00:00Z');

  it('resets card on AGAIN rating', () => {
    const res = calculateSM2({
      repetitionCount: 3,
      intervalDays: 10,
      easeFactor: 2.5,
      rating: 'AGAIN',
    }, baseDate);

    expect(res.repetitionCount).toBe(0);
    expect(res.intervalDays).toBe(0);
    expect(res.easeFactor).toBe(2.3);
    expect(res.status).toBe('LEARNING');
    expect(res.dueDate).toBe('2026-10-26');
  });

  it('handles first successful GOOD review', () => {
    const res = calculateSM2({
      repetitionCount: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      rating: 'GOOD',
    }, baseDate);

    expect(res.repetitionCount).toBe(1);
    expect(res.intervalDays).toBe(1);
    expect(res.dueDate).toBe('2026-10-27');
  });

  it('handles second successful GOOD review', () => {
    const res = calculateSM2({
      repetitionCount: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      rating: 'GOOD',
    }, baseDate);

    expect(res.repetitionCount).toBe(2);
    expect(res.intervalDays).toBe(3);
    expect(res.dueDate).toBe('2026-10-29');
  });

  it('boosts interval on EASY rating', () => {
    const res = calculateSM2({
      repetitionCount: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      rating: 'EASY',
    }, baseDate);

    expect(res.repetitionCount).toBe(1);
    expect(res.intervalDays).toBe(4);
    expect(res.easeFactor).toBe(2.65);
    expect(res.dueDate).toBe('2026-10-30');
  });
});
