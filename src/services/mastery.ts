// Mastery State Calculation Service
// Implements the mastery algorithm from the PRD

import prisma from '@/lib/prisma';
import { MasteryStatus, RagStatus, MasteryRules } from '@/types';

interface MasteryCalculation {
  percentCorrect: number;
  attemptsCount: number;
  masteryStatus: MasteryStatus;
  rag: RagStatus;
}

interface AttemptRecord {
  isCorrect: boolean;
  timestamp: Date;
}

interface MasteryRecord {
  topicId: string;
  masteryStatus: string;
}

const DEFAULT_MASTERY_RULES: MasteryRules = {
  min_recent_attempts: 10,
  min_accuracy: 0.8,
  min_days_span: 3,
};

export async function calculateMasteryState(
  learnerId: string,
  topicId: string,
  masteryRules?: MasteryRules
): Promise<MasteryCalculation> {
  const rules = masteryRules || DEFAULT_MASTERY_RULES;
  
  // Get attempts from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const attempts = await prisma.attempt.findMany({
    where: {
      learnerId,
      topicId,
      timestamp: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
  
  const attemptsCount = attempts.length;
  
  if (attemptsCount === 0) {
    return {
      percentCorrect: 0,
      attemptsCount: 0,
      masteryStatus: 'not_started',
      rag: 'red',
    };
  }
  
  const correctCount = attempts.filter((a: AttemptRecord) => a.isCorrect).length;
  const percentCorrect = correctCount / attemptsCount;
  
  // Calculate days span
  const oldestTimestamp = attempts[0].timestamp;
  const newestTimestamp = attempts[attempts.length - 1].timestamp;
  const daysSpan = Math.floor(
    (newestTimestamp.getTime() - oldestTimestamp.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let masteryStatus: MasteryStatus;
  let rag: RagStatus;
  
  if (percentCorrect < 0.6) {
    masteryStatus = 'learning';
    rag = 'red';
  } else if (percentCorrect < 0.8) {
    masteryStatus = 'practising';
    rag = 'amber';
  } else {
    rag = 'green';
    
    // Check if mastered
    if (
      attemptsCount >= rules.min_recent_attempts &&
      percentCorrect >= rules.min_accuracy &&
      daysSpan >= rules.min_days_span
    ) {
      masteryStatus = 'mastered';
    } else {
      masteryStatus = 'nearly_there';
    }
  }
  
  return {
    percentCorrect,
    attemptsCount,
    masteryStatus,
    rag,
  };
}

export async function updateMasteryState(
  learnerId: string,
  topicId: string,
  trackId: string,
  subjectId: string,
  masteryRules?: MasteryRules
) {
  const calculation = await calculateMasteryState(learnerId, topicId, masteryRules);
  
  const masteryState = await prisma.masteryState.upsert({
    where: {
      learnerId_topicId: {
        learnerId,
        topicId,
      },
    },
    create: {
      learnerId,
      topicId,
      trackId,
      subjectId,
      percentCorrect: calculation.percentCorrect,
      attemptsCount: calculation.attemptsCount,
      masteryStatus: calculation.masteryStatus,
      rag: calculation.rag,
      lastUpdatedAt: new Date(),
    },
    update: {
      percentCorrect: calculation.percentCorrect,
      attemptsCount: calculation.attemptsCount,
      masteryStatus: calculation.masteryStatus,
      rag: calculation.rag,
      lastUpdatedAt: new Date(),
    },
  });
  
  return masteryState;
}

export async function getMasteryStates(
  learnerId: string,
  trackId?: string,
  subjectId?: string
) {
  return prisma.masteryState.findMany({
    where: {
      learnerId,
      ...(trackId && { trackId }),
      ...(subjectId && { subjectId }),
    },
    include: {
      topic: true,
      subject: true,
      track: true,
    },
    orderBy: [
      { trackId: 'asc' },
      { subjectId: 'asc' },
      { topic: { sortOrder: 'asc' } },
    ],
  });
}

export async function checkPrerequisites(
  learnerId: string,
  topicId: string
): Promise<{ unlocked: boolean; missingPrereqs: string[] }> {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });
  
  if (!topic) {
    return { unlocked: false, missingPrereqs: [] };
  }
  
  const prerequisites = (topic.prerequisites as string[]) || [];
  
  if (prerequisites.length === 0) {
    return { unlocked: true, missingPrereqs: [] };
  }
  
  // Check mastery state for all prerequisites
  const prereqMastery = await prisma.masteryState.findMany({
    where: {
      learnerId,
      topicId: { in: prerequisites },
    },
  });
  
  const prereqMap = new Map<string, MasteryRecord>(prereqMastery.map((m: MasteryRecord) => [m.topicId, m]));
  const missingPrereqs: string[] = [];
  
  for (const prereqId of prerequisites) {
    const mastery = prereqMap.get(prereqId);
    if (!mastery || !['nearly_there', 'mastered'].includes(mastery.masteryStatus)) {
      missingPrereqs.push(prereqId);
    }
  }
  
  return {
    unlocked: missingPrereqs.length === 0,
    missingPrereqs,
  };
}
