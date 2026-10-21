import { z } from 'zod';

export const QuestionBlueprintSchema = z.object({
  examId: z.string().uuid(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid(),
  topicName: z.string(),
  pedagogicalObjective: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  context: z.string().optional(),
  reason: z.string() // e.g. "HIGH_ERROR_REINCIDENCE"
});

export type QuestionBlueprint = z.infer<typeof QuestionBlueprintSchema>;

export const GeneratedQuestionSchema = z.object({
  statement: z.string().min(10),
  options: z.array(z.string()).min(2),
  correct_option: z.string().min(1),
  explanation: z.string(),
  assessed_concepts: z.array(z.string()).optional()
}).refine(data => data.options.includes(data.correct_option), {
  message: "A alternativa correta deve estar idêntica na lista de opções.",
  path: ["correct_option"]
});

export const GeneratedBatchSchema = z.object({
  questions: z.array(GeneratedQuestionSchema)
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
