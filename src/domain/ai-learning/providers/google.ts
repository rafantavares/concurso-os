import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { 
  AIProvider, 
  LearningContext, 
  QuestionExplanationSchema, 
  ErrorAnalysisSchema,
  TargetedSummarySchema,
  FlashcardsGenerationSchema,
  GuidedReviewSchema
} from '../types';

export class GoogleAIProvider implements AIProvider {
  private getModel() {
    const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
    return google(modelName);
  }

  private buildSystemPrompt(context: LearningContext): string {
    return `
Você é um tutor inteligente especialista em concursos públicos do sistema ConcursoOS.
Sua função não é montar cronogramas (o Study Intelligence já faz isso), mas sim ENSINAR.
Nunca invente fontes (como "Segundo o edital") se você não tiver acesso direto ao texto do edital.
Seja objetivo, profissional e direto.

CONTEXTO DO CANDIDATO:
Concurso: ${context.examName || 'Não especificado'}
Disciplina: ${context.subjectName}
Assunto: ${context.topicName}

Métricas atuais neste assunto:
- Acerto recente: ${context.performance.recentAccuracy !== null ? context.performance.recentAccuracy.toFixed(1) + '%' : 'Sem dados suficientes'}
- Erros recentes: ${context.performance.recentErrorsCount}
- Índice de Prioridade (SPI): ${context.spiPriority} (Quanto maior, mais crítico).

Adapte sua explicação:
- Se o candidato tem baixo desempenho/alto SPI, seja mais didático, reforce o básico e alerte sobre armadilhas.
- Se o candidato tem alto desempenho/baixo SPI, seja direto ao ponto, avançado e foque nas exceções sutis.
${context.additionalContext ? `\nContexto Adicional:\n${context.additionalContext}` : ''}
    `;
  }

  async generateExplanation(context: LearningContext, question: string, choices: string[], chosen: string, correct: string) {
    const prompt = `
Enunciado da questão:
${question}

Alternativas:
${choices.map((c, i) => `${String.fromCharCode(65 + i)}) ${c}`).join('\n')}

O candidato escolheu: ${chosen}
A resposta correta é: ${correct}

Por favor, explique a questão estruturando a resposta conforme solicitado.
    `;

    const { object } = await generateObject({
      model: this.getModel(),
      system: this.buildSystemPrompt(context),
      prompt,
      schema: QuestionExplanationSchema,
    });

    return object;
  }

  async generateErrorAnalysis(context: LearningContext, question: string, chosen: string, correct: string) {
    const prompt = `
Enunciado:
${question}

Candidato marcou a resposta incorreta: ${chosen}
A resposta correta era: ${correct}

Faça uma análise direta e cirúrgica do erro, mostrando exatamente qual foi a armadilha e qual conceito deve ser memorizado.
    `;

    const { object } = await generateObject({
      model: this.getModel(),
      system: this.buildSystemPrompt(context),
      prompt,
      schema: ErrorAnalysisSchema,
    });

    return object;
  }

  async generateTargetedSummary(context: LearningContext) {
    const prompt = `Gere um resumo focado nos pontos de maior dificuldade para este assunto.`;

    const { object } = await generateObject({
      model: this.getModel(),
      system: this.buildSystemPrompt(context),
      prompt,
      schema: TargetedSummarySchema,
    });

    return object;
  }

  async generateFlashcards(context: LearningContext, count: number) {
    const prompt = `Gere exatamente ${count} flashcards desafiadores sobre o assunto. Baseie-se no fato de que o candidato teve ${context.performance.recentErrorsCount} erros recentes neste tópico. Foque no que ele provavelmente está errando.`;

    const { object } = await generateObject({
      model: this.getModel(),
      system: this.buildSystemPrompt(context),
      prompt,
      schema: FlashcardsGenerationSchema,
    });

    return object;
  }

  async generateGuidedReview(context: LearningContext) {
    const prompt = `Gere uma rápida revisão guiada sobre o assunto.`;

    const { object } = await generateObject({
      model: this.getModel(),
      system: this.buildSystemPrompt(context),
      prompt,
      schema: GuidedReviewSchema,
    });

    return object;
  }
}
