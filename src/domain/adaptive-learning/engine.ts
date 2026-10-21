import { AdaptiveLearningContext, InterventionRecommendation, InterventionType, ConfidenceLevel, InterventionHistoryItem } from './types';

// Helper to calculate confidence based on sample size
function calculateConfidence(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 10) return 'STRONG_EVIDENCE';
  if (sampleSize >= 4) return 'MODERATE_EVIDENCE';
  if (sampleSize >= 2) return 'EARLY_SIGNAL';
  return 'INSUFFICIENT_EVIDENCE';
}

// Analyzes which strategy yielded the highest observed improvement
function findBestObservedIntervention(past: InterventionHistoryItem[]): { bestType: InterventionType | null, improvement: number, sampleSize: number } {
  const effectiveness = new Map<InterventionType, { totalDelta: number, count: number }>();

  for (const item of past) {
    if (item.performanceBefore !== null && item.performanceAfter !== null) {
      const delta = item.performanceAfter - item.performanceBefore;
      const current = effectiveness.get(item.interventionType) || { totalDelta: 0, count: 0 };
      effectiveness.set(item.interventionType, {
        totalDelta: current.totalDelta + delta,
        count: current.count + 1
      });
    }
  }

  let bestType: InterventionType | null = null;
  let highestAverage = -Infinity;
  let bestCount = 0;

  for (const [type, data] of effectiveness.entries()) {
    const avg = data.totalDelta / data.count;
    if (avg > highestAverage) {
      highestAverage = avg;
      bestType = type;
      bestCount = data.count;
    }
  }

  return { bestType, improvement: highestAverage, sampleSize: bestCount };
}

// Deterministic engine to decide the BEST intervention.
// Study Intelligence decides WHAT. Adaptive Learning decides HOW.
export function recommendIntervention(context: AdaptiveLearningContext): InterventionRecommendation {
  
  // 1. Analyze historical evidence
  const { bestType, improvement, sampleSize } = findBestObservedIntervention(context.pastInterventions);
  
  if (bestType && improvement > 0 && sampleSize >= 2) {
    const conf = calculateConfidence(sampleSize);
    return {
      recommendedType: bestType,
      reason: `Baseado no seu histórico, a intervenção do tipo ${bestType} apresentou uma evolução observada de +${improvement.toFixed(1)} pontos neste conteúdo.`,
      confidence: conf
    };
  }

  // 2. Look for stagnation in recent interventions (User repeats something without success)
  if (context.pastInterventions.length >= 3) {
    const recent = context.pastInterventions.slice(0, 3);
    const allSame = recent.every(r => r.interventionType === recent[0].interventionType);
    
    // Check if performance is dropping or stalling
    let stalling = true;
    for (const r of recent) {
      if (r.performanceBefore !== null && r.performanceAfter !== null && (r.performanceAfter - r.performanceBefore > 2)) {
        stalling = false;
        break;
      }
    }

    if (allSame && stalling) {
      const failedType = recent[0].interventionType;
      // Propose an alternative
      const alternative = failedType === 'THEORY' ? 'QUESTIONS' : 'GUIDED_REVIEW';
      return {
        recommendedType: alternative,
        reason: `As últimas 3 sessões focadas em ${failedType} não apresentaram evolução significativa. Recomendamos alterar a abordagem para ${alternative}.`,
        confidence: 'EARLY_SIGNAL'
      };
    }
  }

  // 3. Fallbacks based on Domain & SPI (Heuristics when no strong evidence exists)
  const accuracy = context.performance.recentAccuracy;
  const spi = context.spiPriority;

  if (accuracy === null) {
    // Unknown domain, assume beginner or needs baseline tracking
    return {
      recommendedType: 'THEORY',
      reason: 'Ainda não temos dados suficientes de desempenho. Recomendamos leitura teórica ou questões de sondagem.',
      confidence: 'INSUFFICIENT_EVIDENCE'
    };
  }

  if (accuracy < 60 && spi > 60) {
    // Low performance, high priority (critical)
    if (context.performance.recentErrorsCount > 3) {
      return {
        recommendedType: 'GUIDED_REVIEW',
        reason: 'O domínio está baixo e há reincidência de erros. Uma revisão guiada pode ajudar a desconstruir as armadilhas.',
        confidence: 'INSUFFICIENT_EVIDENCE'
      };
    }
    return {
      recommendedType: 'QUESTIONS',
      reason: 'Domínio baixo. Resolução de questões direcionadas focadas no ponto fraco.',
      confidence: 'INSUFFICIENT_EVIDENCE'
    };
  }

  if (accuracy >= 80) {
    // High performance
    if (spi > 50) {
      // But SPI is rising (maybe forgot it recently?)
      return {
        recommendedType: 'REVIEW',
        reason: 'Seu desempenho é bom, mas o sistema identificou necessidade de revisitar o assunto para evitar perda de retenção.',
        confidence: 'INSUFFICIENT_EVIDENCE'
      };
    }
    return {
      recommendedType: 'MIXED_QUESTIONS',
      reason: 'Excelente domínio. Recomendamos testes rápidos de manutenção em baterias mistas.',
      confidence: 'INSUFFICIENT_EVIDENCE'
    };
  }

  // Default Middle Ground
  return {
    recommendedType: 'QUESTIONS',
    reason: 'Resolução padrão de questões para gerar mais evidências.',
    confidence: 'INSUFFICIENT_EVIDENCE'
  };
}
