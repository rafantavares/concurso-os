export type ReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface SM2Input {
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  rating: ReviewRating;
}

export interface SM2Output {
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  dueDate: string; // YYYY-MM-DD
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
}

/**
 * Implements the SuperMemo-2 (SM-2) spaced repetition algorithm
 * adapted for modern digital flashcards (Anki style).
 */
export function calculateSM2(input: SM2Input, referenceDate: Date = new Date()): SM2Output {
  const { repetitionCount, intervalDays, easeFactor, rating } = input;

  let newRepetitions = repetitionCount;
  let newInterval = intervalDays;
  let newEaseFactor = easeFactor;
  let newStatus: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED' = 'REVIEW';

  switch (rating) {
    case 'AGAIN': {
      // Failed card: reset streak, review again today/tomorrow
      newRepetitions = 0;
      newInterval = 0; // Due today
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      newStatus = 'LEARNING';
      break;
    }
    case 'HARD': {
      // Hard recall: small interval bump, decrease ease factor
      if (repetitionCount === 0) {
        newInterval = 1;
      } else {
        newInterval = Math.max(1, Math.round(intervalDays * 1.2));
      }
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      newStatus = 'REVIEW';
      break;
    }
    case 'GOOD': {
      // Normal good recall: standard SM-2 scaling
      if (repetitionCount === 0) {
        newInterval = 1;
      } else if (repetitionCount === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(intervalDays * easeFactor);
      }
      newRepetitions += 1;
      newStatus = newInterval >= 21 ? 'MASTERED' : 'REVIEW';
      break;
    }
    case 'EASY': {
      // Instant effortless recall: boost interval and ease factor
      if (repetitionCount === 0) {
        newInterval = 4;
      } else {
        newInterval = Math.round(intervalDays * easeFactor * 1.3);
      }
      newEaseFactor += 0.15;
      newRepetitions += 1;
      newStatus = newInterval >= 21 ? 'MASTERED' : 'REVIEW';
      break;
    }
  }

  // Calculate future due date: referenceDate + newInterval days
  const targetDate = new Date(referenceDate);
  targetDate.setDate(targetDate.getDate() + newInterval);
  const dueDate = targetDate.toISOString().split('T')[0];

  return {
    repetitionCount: newRepetitions,
    intervalDays: newInterval,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    dueDate,
    status: newStatus,
  };
}
