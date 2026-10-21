import { describe, it, expect } from 'vitest';
import { 
  QuestionExplanationSchema, 
  ErrorAnalysisSchema,
  TargetedSummarySchema,
  FlashcardsGenerationSchema,
  GuidedReviewSchema
} from './types';

describe('AI Learning Schemas', () => {
  it('should validate QuestionExplanationSchema successfully', () => {
    const validData = {
      correctAnswer: 'A',
      explanation: 'Explanation text',
      alternativeExplanations: [
        { alternative: 'B', whyIncorrect: 'Wrong because X' }
      ],
      keyConcepts: ['Concept 1'],
      commonMistakes: ['Mistake 1'],
      reviewSuggestion: 'Review chapter 2'
    };
    const result = QuestionExplanationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail QuestionExplanationSchema if data is missing', () => {
    const invalidData = {
      correctAnswer: 'A',
      // explanation is missing
      alternativeExplanations: [],
      keyConcepts: [],
      commonMistakes: [],
      reviewSuggestion: ''
    };
    const result = QuestionExplanationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate FlashcardsGenerationSchema successfully', () => {
    const validData = {
      flashcards: [
        {
          question: 'What is X?',
          answer: 'X is Y',
          whyImportantForUser: 'You got this wrong 3 times.'
        }
      ]
    };
    const result = FlashcardsGenerationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
