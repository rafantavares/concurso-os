import { z } from 'zod';
import { TopicPerformanceData } from '@/domain/study-intelligence/types';

export interface LearningContext {
  examName?: string;
  subjectName: string;
  topicName: string;
  performance: TopicPerformanceData; // From Study Intelligence
  spiPriority: number; // SPI priority level
  additionalContext?: string; // Optional context, like a specific question
}

export const QuestionExplanationSchema = z.object({
  correctAnswer: z.string().describe('The correct answer among the alternatives.'),
  explanation: z.string().describe('Objective explanation of why the answer is correct.'),
  alternativeExplanations: z.array(
    z.object({
      alternative: z.string(),
      whyIncorrect: z.string()
    })
  ).describe('Why other choices were wrong.'),
  keyConcepts: z.array(z.string()).describe('List of key concepts involved.'),
  commonMistakes: z.array(z.string()).describe('Common pitfalls candidates fall into.'),
  reviewSuggestion: z.string().describe('Short review suggestion tailored to the candidate context.')
});
export type QuestionExplanation = z.infer<typeof QuestionExplanationSchema>;

export const ErrorAnalysisSchema = z.object({
  identifiedError: z.string().describe('What exactly the candidate misunderstood.'),
  conceptExplanation: z.string().describe('Clear explanation of the concept.'),
  whyChosenIsWrong: z.string().describe('Direct explanation of why their specific choice was wrong.'),
  trapRecognition: z.string().describe('How to spot this trap/trick in future questions.'),
  essentialReviewConcept: z.string().describe('The core concept to memorize.')
});
export type ErrorAnalysis = z.infer<typeof ErrorAnalysisSchema>;

export const TargetedSummarySchema = z.object({
  summary: z.string().describe('A concise summary focusing heavily on the candidates weak points.'),
  criticalBulletPoints: z.array(z.string()).describe('Most important points to memorize.')
});
export type TargetedSummary = z.infer<typeof TargetedSummarySchema>;

export const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
  whyImportantForUser: z.string().describe('Explanation of why this card was generated for this specific user context.')
});

export const FlashcardsGenerationSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('List of generated flashcards. Must be highly focused.')
});
export type FlashcardsGeneration = z.infer<typeof FlashcardsGenerationSchema>;

export const GuidedReviewSchema = z.object({
  essentialConcept: z.string(),
  commonUserError: z.string().describe('An error the user usually commits, based on context.'),
  example: z.string(),
  verificationQuestion: z.string().describe('A quick test question to verify understanding.'),
  verificationAnswer: z.string(),
  finalSummary: z.string()
});
export type GuidedReview = z.infer<typeof GuidedReviewSchema>;

export interface AIProvider {
  generateExplanation(context: LearningContext, question: string, choices: string[], chosen: string, correct: string): Promise<QuestionExplanation>;
  generateErrorAnalysis(context: LearningContext, question: string, chosen: string, correct: string): Promise<ErrorAnalysis>;
  generateTargetedSummary(context: LearningContext): Promise<TargetedSummary>;
  generateFlashcards(context: LearningContext, count: number): Promise<FlashcardsGeneration>;
  generateGuidedReview(context: LearningContext): Promise<GuidedReview>;
}
