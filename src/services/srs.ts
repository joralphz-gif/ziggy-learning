// Spaced Repetition System (SRS) Service
// Implements the SRS algorithm from the PRD

import prisma from '@/lib/prisma';

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const EASE_INCREMENT = 0.05;
const EASE_DECREMENT = 0.1;

interface SrsUpdateResult {
  intervalDays: number;
  easeFactor: number;
  nextDueAt: Date;
  reviewCount: number;
  lapseCount: number;
}

interface ItemWithRelations {
  id: string;
  topic: { name: string };
  subject: { name: string };
}

interface SrsEntryWithItem {
  nextDueAt: Date;
  intervalDays: number;
  lapseCount: number;
  reviewCount: number;
  item: ItemWithRelations;
}

export async function updateSrsEntry(
  learnerId: string,
  itemId: string,
  trackId: string,
  topicId: string,
  isCorrect: boolean
): Promise<SrsUpdateResult> {
  // Get existing SRS entry or create defaults
  const existing = await prisma.srsEntry.findUnique({
    where: {
      learnerId_itemId: {
        learnerId,
        itemId,
      },
    },
  });
  
  let interval: number;
  let ease: number;
  let reviewCount: number;
  let lapseCount: number;
  
  if (!existing) {
    interval = 1;
    ease = DEFAULT_EASE_FACTOR;
    reviewCount = 0;
    lapseCount = 0;
  } else {
    interval = existing.intervalDays;
    ease = existing.easeFactor;
    reviewCount = existing.reviewCount;
    lapseCount = existing.lapseCount;
  }
  
  // Apply SRS algorithm
  if (isCorrect) {
    reviewCount += 1;
    ease = ease + EASE_INCREMENT;
    interval = Math.max(1, Math.round(interval * ease));
  } else {
    lapseCount += 1;
    ease = Math.max(MIN_EASE_FACTOR, ease - EASE_DECREMENT);
    interval = 1;
  }
  
  // Calculate next due date
  const nextDueAt = new Date();
  nextDueAt.setDate(nextDueAt.getDate() + interval);
  
  // Upsert the SRS entry
  await prisma.srsEntry.upsert({
    where: {
      learnerId_itemId: {
        learnerId,
        itemId,
      },
    },
    create: {
      learnerId,
      itemId,
      trackId,
      topicId,
      intervalDays: interval,
      easeFactor: ease,
      nextDueAt,
      reviewCount,
      lapseCount,
      lastReviewedAt: new Date(),
    },
    update: {
      intervalDays: interval,
      easeFactor: ease,
      nextDueAt,
      reviewCount,
      lapseCount,
      lastReviewedAt: new Date(),
    },
  });
  
  return {
    intervalDays: interval,
    easeFactor: ease,
    nextDueAt,
    reviewCount,
    lapseCount,
  };
}

export async function getDueItems(
  learnerId: string,
  date: Date = new Date(),
  maxItems: number = 20,
  trackId?: string
) {
  // Set to end of day to include all items due today
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const srsEntries = await prisma.srsEntry.findMany({
    where: {
      learnerId,
      nextDueAt: {
        lte: endOfDay,
      },
      ...(trackId && { trackId }),
    },
    include: {
      item: {
        include: {
          topic: true,
          subject: true,
        },
      },
    },
    orderBy: [
      { nextDueAt: 'asc' },
      { lapseCount: 'desc' }, // Prioritize items with more lapses
    ],
    take: maxItems,
  });
  
  return srsEntries.map((entry: SrsEntryWithItem) => ({
    ...entry.item,
    srs: {
      nextDueAt: entry.nextDueAt,
      intervalDays: entry.intervalDays,
      lapseCount: entry.lapseCount,
      reviewCount: entry.reviewCount,
    },
  }));
}

export async function getSrsStats(learnerId: string, trackId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [dueToday, dueThisWeek, totalReviewed] = await Promise.all([
    prisma.srsEntry.count({
      where: {
        learnerId,
        nextDueAt: { lte: tomorrow },
        ...(trackId && { trackId }),
      },
    }),
    prisma.srsEntry.count({
      where: {
        learnerId,
        nextDueAt: { lte: nextWeek },
        ...(trackId && { trackId }),
      },
    }),
    prisma.srsEntry.aggregate({
      where: {
        learnerId,
        ...(trackId && { trackId }),
      },
      _sum: { reviewCount: true },
    }),
  ]);
  
  return {
    dueToday,
    dueThisWeek,
    totalReviewed: totalReviewed._sum.reviewCount || 0,
  };
}

export async function initializeSrsForItem(
  learnerId: string,
  itemId: string,
  trackId: string,
  topicId: string
) {
  // Check if entry already exists
  const existing = await prisma.srsEntry.findUnique({
    where: {
      learnerId_itemId: { learnerId, itemId },
    },
  });
  
  if (existing) return existing;
  
  // Create new entry due immediately
  return prisma.srsEntry.create({
    data: {
      learnerId,
      itemId,
      trackId,
      topicId,
      intervalDays: 1,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextDueAt: new Date(),
      reviewCount: 0,
      lapseCount: 0,
    },
  });
}
