import { CandidatePreparationSummary, Insight, PreparationStatus, SubjectProgress, Trend } from './types';

export interface RawAnalyticsData {
  adherence: {
    plannedMinutes: number;
    realizedMinutes: number;
  };
  subjects: SubjectProgress[];
  strategyEffectiveness: Array<{
    interventionType: string;
    sampleSize: number;
    averageObservedImprovement: number;
  }>;
}

function determineStatus(globalAccuracy: number | null, adherence: number | null, hoursRealized: number): PreparationStatus {
  if (hoursRealized < 5 || globalAccuracy === null) return 'CALIBRANDO';
  
  if (globalAccuracy < 60) {
    if (adherence && adherence >= 70) return 'CONSTRUINDO_BASE';
    return 'ATENCAO'; // Low performance and low adherence
  }

  if (globalAccuracy >= 60 && globalAccuracy < 80) {
    if (adherence && adherence < 50) return 'ATENCAO'; // Dropping the ball
    return 'EVOLUINDO';
  }

  return 'CONSOLIDANDO'; // > 80%
}

function generateInsights(data: RawAnalyticsData, status: PreparationStatus): Insight[] {
  const insights: Insight[] = [];

  const adherence = data.adherence.plannedMinutes > 0 
    ? (data.adherence.realizedMinutes / data.adherence.plannedMinutes) * 100 
    : null;

  if (adherence !== null && adherence < 60 && data.adherence.plannedMinutes > 0) {
    insights.push({
      type: 'LOW_PLAN_ADHERENCE',
      context: `Você realizou apenas ${Math.round(adherence)}% das horas planejadas recentemente.`
    });
  } else if (adherence !== null && adherence > 85) {
    insights.push({
      type: 'HIGH_PLAN_ADHERENCE',
      context: `Excelente consistência! Você cumpriu ${Math.round(adherence)}% do planejamento.`
    });
  }

  let biggestBottleneck: SubjectProgress | null = null;

  for (const sub of data.subjects) {
    if (sub.trend === 'IMPROVING' && sub.trendValue && sub.trendValue > 5) {
      insights.push({
        type: 'PERFORMANCE_IMPROVING',
        context: `Seu desempenho em ${sub.subjectName} aumentou ${Math.round(sub.trendValue)} pontos observados.`
      });
    }

    if (sub.trend === 'DECLINING' && sub.trendValue && sub.trendValue < -5) {
      insights.push({
        type: 'PERFORMANCE_DECLINING',
        context: `Alerta: Queda recente de ${Math.abs(Math.round(sub.trendValue))} pontos em ${sub.subjectName}.`
      });
    }

    if (sub.hoursStudied > 10 && sub.trendValue !== null && sub.trendValue < 2 && sub.accuracy !== null && sub.accuracy < 70) {
      insights.push({
        type: 'HIGH_EFFORT_LOW_PROGRESS',
        context: `Você acumulou esforço significativo em ${sub.subjectName}, mas a evolução observada continua pequena.`
      });
    }

    // Identify bottleneck
    if (!biggestBottleneck || sub.spiAvg > biggestBottleneck.spiAvg) {
      if (sub.spiAvg > 60) {
        biggestBottleneck = sub;
      }
    }
  }

  if (biggestBottleneck) {
    insights.push({
      type: 'MAIN_BOTTLENECK',
      context: `Seu maior gargalo atual é ${biggestBottleneck.subjectName} (SPI Médio: ${Math.round(biggestBottleneck.spiAvg)}).`
    });
  }

  return insights;
}

export function buildPreparationSummary(data: RawAnalyticsData): CandidatePreparationSummary {
  let totalAcc = 0;
  let accCount = 0;
  let totalCov = 0;
  let covCount = 0;
  let totalQ = 0;

  for (const sub of data.subjects) {
    if (sub.accuracy !== null) {
      totalAcc += sub.accuracy;
      accCount++;
    }
    if (sub.coverage !== null) {
      totalCov += sub.coverage;
      covCount++;
    }
    totalQ += sub.questionsAnswered;
  }

  const globalAccuracy = accCount > 0 ? totalAcc / accCount : null;
  const globalCoverage = covCount > 0 ? totalCov / covCount : null;
  const adherence = data.adherence.plannedMinutes > 0 
    ? (data.adherence.realizedMinutes / data.adherence.plannedMinutes) * 100 
    : null;

  const hoursPlanned = data.adherence.plannedMinutes / 60;
  const hoursRealized = data.adherence.realizedMinutes / 60;

  const status = determineStatus(globalAccuracy, adherence, hoursRealized);
  const insights = generateInsights(data, status);

  return {
    status,
    globalAccuracy,
    globalCoverage,
    adherencePercentage: adherence,
    hoursPlanned,
    hoursRealized,
    questionsAnswered: totalQ,
    subjects: data.subjects,
    insights,
    strategyEffectiveness: data.strategyEffectiveness
  };
}
