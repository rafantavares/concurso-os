import { TopicPerformanceData, ExplanationReason, ExplanationReasonType } from './types';

// Configurable Weights for MVP
export const WEIGHTS = {
  PERFORMANCE: 35,
  TREND: 15,
  RECENCY: 15,
  REINCIDENCE: 15,
  RELEVANCE: 10,
  COVERAGE: 10
};

export const TARGET_ACCURACY = 85;

export interface SPIResult {
  spi: number;
  reasons: ExplanationReason[];
  isInsufficientData: boolean;
}

export function calculateSPI(topic: TopicPerformanceData): SPIResult {
  let spi = 0;
  const reasons: ExplanationReason[] = [];

  // 1. Performance / Accuracy (Risk of low performance)
  if (topic.recentAccuracy !== null) {
    if (topic.questionsAnsweredRecent >= 5) {
      const gap = TARGET_ACCURACY - topic.recentAccuracy;
      if (gap > 0) {
        const perfScore = Math.min((gap / TARGET_ACCURACY) * WEIGHTS.PERFORMANCE * 2, WEIGHTS.PERFORMANCE);
        spi += perfScore;
        if (topic.recentAccuracy < 65) {
          reasons.push({ type: 'LOW_ACCURACY', value: topic.recentAccuracy, context: `${topic.recentAccuracy}% de acerto nas últimas questões.` });
        }
      }
    }
  } else if (topic.hoursStudied > 0 && topic.questionsAnsweredRecent === 0) {
     // Studied but not tested
     spi += WEIGHTS.PERFORMANCE * 0.5;
  }

  // 2. Trend (Negative trend increases SPI)
  if (topic.recentAccuracy !== null && topic.previousAccuracy !== null && topic.questionsAnsweredRecent >= 5) {
    const diff = topic.recentAccuracy - topic.previousAccuracy;
    if (diff < -3) {
      const trendScore = Math.min(Math.abs(diff) * 1.5, WEIGHTS.TREND);
      spi += trendScore;
      reasons.push({ type: 'NEGATIVE_TREND', value: diff, context: `Queda de ${Math.abs(diff)}% no desempenho recente.` });
    }
  }

  // 3. Recency (Decay function)
  if (topic.daysSinceLastReview !== null) {
    if (topic.daysSinceLastReview > 5) {
      const recencyScore = Math.min((topic.daysSinceLastReview - 5) * 1.5, WEIGHTS.RECENCY);
      spi += recencyScore;
      if (topic.daysSinceLastReview > 10) {
        reasons.push({ type: 'TIME_SINCE_REVIEW', value: topic.daysSinceLastReview, context: `${topic.daysSinceLastReview} dias sem interação.` });
      }
    }
  } else {
    spi += WEIGHTS.RECENCY * 0.8; 
  }

  // 4. Reincidence (Repeated errors)
  if (topic.recentErrorsCount >= 2) {
    const reincScore = Math.min(topic.recentErrorsCount * 4, WEIGHTS.REINCIDENCE);
    spi += reincScore;
    if (topic.recentErrorsCount >= 3) {
      reasons.push({ type: 'HIGH_ERROR_REINCIDENCE', value: topic.recentErrorsCount, context: `${topic.recentErrorsCount} erros recentes.` });
    }
  }

  // 5. Relevance
  if (topic.examWeight > 1) {
    const relScore = Math.min(topic.examWeight * 2.5, WEIGHTS.RELEVANCE);
    spi += relScore;
    if (topic.examWeight >= 3) {
      reasons.push({ type: 'HIGH_EXAM_RELEVANCE', value: topic.examWeight, context: `Alta relevância no edital.` });
    }
  }

  // 6. Coverage
  if (topic.estimatedHoursToCover !== null && topic.estimatedHoursToCover > 0) {
    const coverageRatio = topic.hoursStudied / topic.estimatedHoursToCover;
    if (coverageRatio < 0.6) {
      const covScore = Math.min((1 - coverageRatio) * WEIGHTS.COVERAGE, WEIGHTS.COVERAGE);
      spi += covScore;
      if (coverageRatio < 0.3) {
        reasons.push({ type: 'LOW_COVERAGE', value: Math.round(coverageRatio * 100), context: `Cobertura de apenas ${Math.round(coverageRatio * 100)}%.` });
      }
    }
  }

  const isInsufficientData = 
    topic.recentAccuracy === null && 
    topic.hoursStudied === 0 && 
    topic.questionsAnsweredRecent < 5;

  return {
    spi: Math.min(Math.round(spi), 100),
    reasons,
    isInsufficientData
  };
}
