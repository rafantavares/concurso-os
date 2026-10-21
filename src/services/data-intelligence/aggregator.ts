import { TopicPerformanceData } from '@/domain/study-intelligence/types';

export interface RawDataParams {
  topics: any[]; // Joined with subjects for weight and estimated_hours (if added later)
  answers: any[];
  sessions: any[];
  referenceDate?: Date; // To allow time-travel testing
}

export function aggregatePerformanceData({
  topics,
  answers,
  sessions,
  referenceDate = new Date()
}: RawDataParams): TopicPerformanceData[] {
  
  const RECENT_DAYS = 7;
  const PREVIOUS_DAYS = 14; // From 14 to 7 days ago

  const recentThreshold = new Date(referenceDate.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000);
  const previousThreshold = new Date(referenceDate.getTime() - PREVIOUS_DAYS * 24 * 60 * 60 * 1000);

  return topics.map(topic => {
    // 1. Filter events for this topic
    const topicAnswers = answers.filter(a => a.topic_id === topic.id);
    const topicSessions = sessions.filter(s => s.topic_id === topic.id);

    // Sort answers by date DESC (newest first)
    topicAnswers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    topicSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 2. Time Windows for Performance
    const recentAnswers = topicAnswers.filter(a => new Date(a.created_at) >= recentThreshold);
    const previousAnswers = topicAnswers.filter(a => {
      const d = new Date(a.created_at);
      return d >= previousThreshold && d < recentThreshold;
    });

    const calculateAcc = (ans: any[]) => {
      if (ans.length === 0) return null;
      let totalWeight = 0;
      let correctWeight = 0;
      for (const a of ans) {
        // Evaluate origin weight: AI_GENERATED shouldn't distort official metrics heavily
        const stype = Array.isArray(a.questions) ? a.questions[0]?.source_type : a.questions?.source_type;
        const weight = stype === 'AI_GENERATED' ? 0.5 : 1.0;
        
        totalWeight += weight;
        if (a.is_correct) {
          correctWeight += weight;
        }
      }
      if (totalWeight === 0) return null;
      return Math.round((correctWeight / totalWeight) * 100);
    };

    const recentAccuracy = calculateAcc(recentAnswers);
    const previousAccuracy = calculateAcc(previousAnswers);

    // 3. Reincidence (Consecutive or dense recent errors)
    // We look at the latest 5 answers overall (if they occurred recently)
    // Or just look at the `recentAnswers` density. Let's look at recentAnswers density.
    let recentErrorsCount = 0;
    if (recentAnswers.length > 0) {
      // Just count total errors in the recent window for now, but we can weight consecutive ones.
      // A simple approach: count errors in the last 10 attempts that fall in the recent window.
      const latestAttempts = recentAnswers.slice(0, 10);
      recentErrorsCount = latestAttempts.filter(a => !a.is_correct).length;
    }

    // 4. Recency
    let daysSinceLastReview = null;
    const allInteractions = [
      ...topicAnswers.map(a => a.created_at),
      ...topicSessions.map(s => s.created_at)
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (allInteractions.length > 0) {
      const lastDate = new Date(allInteractions[0]);
      const diffMs = referenceDate.getTime() - lastDate.getTime();
      daysSinceLastReview = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // 5. Coverage
    const hoursStudied = topicSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60;
    // Estimated hours could come from a new column or relation, if absent, it's null
    const estimatedHoursToCover = topic.estimated_hours || null; 

    // 6. Relevance
    // We expect weight to be passed down from the joined subject
    const examWeight = topic.subjects?.weight ?? 1;

    return {
      topicId: topic.id,
      topicName: topic.name,
      recentAccuracy,
      previousAccuracy,
      questionsAnsweredRecent: recentAnswers.length,
      daysSinceLastReview,
      recentErrorsCount,
      examWeight,
      hoursStudied,
      estimatedHoursToCover
    };
  });
}
