'use server';

import { createClient } from '@/lib/supabase/server';
import { getAggregatedPerformanceData } from '@/services/data-intelligence/performanceService';
import { generateAdaptiveSchedule } from '@/domain/study-intelligence';
import { GoogleAIProvider } from '@/domain/ai-learning/providers/google';
import { LearningContext, AIProvider } from '@/domain/ai-learning/types';

function getProvider(): AIProvider {
  // Can be selected via process.env.AI_PROVIDER
  return new GoogleAIProvider();
}

async function buildLearningContext(userId: string, examId: string, topicId: string): Promise<LearningContext | null> {
  const aggregatedTopics = await getAggregatedPerformanceData(userId, examId);
  
  // We need a dummy hours to generate the schedule just to get SPI, let's say 10h
  const plan = generateAdaptiveSchedule({ availableHours: 10, topics: aggregatedTopics });

  const topicPerf = aggregatedTopics.find(t => t.topicId === topicId);
  const topicSpiInfo = plan.find(p => p.topicId === topicId);

  if (!topicPerf || !topicSpiInfo) return null;

  // Let's grab exam title and subject name roughly. 
  // (In a real scenario, we'd query the DB to get exact names if not fully populated in performanceData).
  const supabase = await createClient();
  const { data: examData } = await supabase.from('exams').select('title').eq('id', examId).single();
  const { data: topicData } = await supabase.from('topics').select('subjects(name)').eq('id', topicId).single();

  const subjectName = Array.isArray(topicData?.subjects) 
    ? (topicData?.subjects[0] as any)?.name 
    : (topicData?.subjects as any)?.name || 'Disciplina Desconhecida';

  return {
    examName: examData?.title,
    subjectName,
    topicName: topicPerf.topicName,
    performance: topicPerf,
    spiPriority: topicSpiInfo.spi
  };
}

export async function explainQuestion(examId: string, topicId: string, question: string, choices: string[], chosen: string, correct: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const context = await buildLearningContext(user.id, examId, topicId);
    if (!context) throw new Error('Topic not found in user history');

    const provider = getProvider();
    const result = await provider.generateExplanation(context, question, choices, chosen, correct);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('AI error:', error);
    return { success: false, error: 'Falha ao processar explicação com IA.' };
  }
}

export async function explainError(examId: string, topicId: string, question: string, chosen: string, correct: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const context = await buildLearningContext(user.id, examId, topicId);
    if (!context) throw new Error('Topic not found in user history');

    const provider = getProvider();
    const result = await provider.generateErrorAnalysis(context, question, chosen, correct);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('AI error:', error);
    return { success: false, error: 'Falha ao analisar o erro.' };
  }
}

export async function generateSummary(examId: string, topicId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const context = await buildLearningContext(user.id, examId, topicId);
    if (!context) throw new Error('Topic not found');

    const provider = getProvider();
    const result = await provider.generateTargetedSummary(context);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('AI error:', error);
    return { success: false, error: 'Falha ao gerar o resumo.' };
  }
}

export async function generateGuidedReview(examId: string, topicId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const context = await buildLearningContext(user.id, examId, topicId);
    if (!context) throw new Error('Topic not found');

    const provider = getProvider();
    const result = await provider.generateGuidedReview(context);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('AI error:', error);
    return { success: false, error: 'Falha ao gerar revisão guiada.' };
  }
}

export async function generateFlashcards(examId: string, topicId: string, origin: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const context = await buildLearningContext(user.id, examId, topicId);
    if (!context) throw new Error('Topic not found');

    const provider = getProvider();
    const result = await provider.generateFlashcards(context, 3);
    
    // Save generated flashcards to database
    if (result.flashcards.length > 0) {
      const inserts = result.flashcards.map(fc => ({
        user_id: user.id,
        topic_id: topicId,
        front_text: fc.question,
        back_text: fc.answer,
        origin,
        context_reason: fc.whyImportantForUser,
        difficulty: 'NORMAL' // Baseline, could be AI generated as well
      }));
      
      const { error } = await supabase.from('ai_flashcards').insert(inserts);
      if (error) console.error('Failed to save flashcards:', error);
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('AI error:', error);
    return { success: false, error: 'Falha ao gerar flashcards.' };
  }
}
