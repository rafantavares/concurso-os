import { StudyIntelligenceInput, TopicRecommendation } from './types';
import { allocateTime } from './allocator';
import { calculateSPI } from './spi';

export * from './types';
export { calculateSPI } from './spi';
export { allocateTime } from './allocator';

/**
 * Motor Principal de Inteligência de Estudos
 * Transforma o histórico de performance do usuário em um plano de alocação de horas.
 */
export function generateAdaptiveSchedule(input: StudyIntelligenceInput): TopicRecommendation[] {
  return allocateTime(input.availableHours, input.topics);
}
