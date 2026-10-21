import { z } from 'zod';

export const QuestionDifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const QuestionSourceTypeEnum = z.enum(['OFFICIAL', 'USER_CREATED', 'AI_GENERATED', 'IMPORTED']);

export const QuestionImportSchema = z.object({
  exam_id: z.string().uuid().optional().nullable(),
  subject_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid({ message: "O assunto (topic_id) é obrigatório." }),
  statement: z.string().min(10, { message: "O enunciado deve ter pelo menos 10 caracteres." }),
  options: z.array(z.string()).min(2, { message: "A questão deve ter pelo menos 2 alternativas." }),
  correct_option: z.string().min(1, { message: "A resposta correta é obrigatória." }),
  difficulty: QuestionDifficultyEnum.default('MEDIUM'),
  source_type: QuestionSourceTypeEnum.default('USER_CREATED'),
  origin: z.string().optional().nullable(),
  year: z.number().int().optional().nullable()
}).refine(data => data.options.includes(data.correct_option), {
  message: "A alternativa correta (correct_option) deve estar exatamente igual a uma das opções na lista (options).",
  path: ["correct_option"]
});

export type QuestionImportDTO = z.infer<typeof QuestionImportSchema>;

export const BulkImportSchema = z.array(QuestionImportSchema);

export interface QuestionFilters {
  examId?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sourceType?: 'OFFICIAL' | 'USER_CREATED' | 'AI_GENERATED' | 'IMPORTED';
  query?: string; // Text search in statement
  page: number;
  limit: number;
}
