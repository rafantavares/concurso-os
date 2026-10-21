import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { QuestionBlueprint, GeneratedBatchSchema, GeneratedQuestion } from './types';

export async function generateQuestionsForWeakness(
  blueprint: QuestionBlueprint, 
  count: number = 3
): Promise<GeneratedQuestion[]> {
  const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
  const model = google(modelName);

  const systemPrompt = `
Você é o AI Content Engine do ConcursoOS. Sua função é gerar questões estruturadas de múltipla escolha para suprir lacunas do banco de dados, focadas exatamente na dificuldade atual do candidato.
Nunca gere questões sobre assuntos fora do escopo solicitado.
Sempre retorne as alternativas e garanta que a "correct_option" seja uma cópia literal e exata da alternativa correta.
`;

  const prompt = `
GERAÇÃO SOLICITADA: ${count} questões.

CONTEXTO / BLUEPRINT:
- Assunto: ${blueprint.topicName}
- Objetivo Pedagógico: ${blueprint.pedagogicalObjective}
- Dificuldade Requerida: ${blueprint.difficulty}
- Motivo da Geração: ${blueprint.reason}
${blueprint.context ? `- Contexto Adicional do Erro: ${blueprint.context}` : ''}

CRITÉRIOS:
1. Crie enunciados claros e diretos.
2. Evite alternativas absurdas ou óbvias demais.
3. Não use a mesma redação entre as questões.
4. Forneça uma explicação pedagógica sucinta do gabarito.
`;

  try {
    const { object } = await generateObject({
      model,
      system: systemPrompt,
      prompt,
      schema: GeneratedBatchSchema,
    });

    return object.questions;
  } catch (error) {
    console.error('AI Content Engine Error:', error);
    throw new Error('Falha na geração de questões adaptativas.');
  }
}
