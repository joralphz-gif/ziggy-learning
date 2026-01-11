// Today Plan Generator Service
// Implements the planner algorithm from the PRD

import prisma from '@/lib/prisma';
import { getDueItems } from './srs';
import { TodayPlan, TodayBlock } from '@/types';

interface TrackRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ItemWithTopic {
  id: string;
  topic: { name: string } | null;
}

interface MasteryStateRecord {
  topicId: string;
  masteryStatus: string;
}

const DEFAULT_DAILY_MINUTES = 90;

const TRACK_WEIGHTS: Record<string, number> = {
  track_11plus: 0.55,
  track_coding: 0.30,
  track_animation: 0.08,
  track_digital_health: 0.07,
};

const GREETINGS = [
  "Ready to learn something amazing today! 🌟",
  "Let's make today awesome! 🚀",
  "Time for some brain-building fun! 🧠",
  "Your learning adventure awaits! ✨",
  "Let's unlock some new superpowers! 💪",
  "Ready, set, learn! 🎯",
];

function getGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function generateTodayPlan(
  learnerId: string,
  date: Date = new Date()
): Promise<TodayPlan> {
  const dateStr = formatDate(date);
  const targetMinutes = DEFAULT_DAILY_MINUTES;
  
  // Get all tracks for icons/colors
  const tracks = await prisma.track.findMany();
  const trackMap = new Map<string, TrackRecord>(tracks.map((t: TrackRecord) => [t.id, t]));
  
  // Step 1: Get review items (SRS due today)
  const reviewItems = await getDueItems(learnerId, date, 10);
  const reviewBlockMinutes = Math.min(15, Math.floor(targetMinutes * 0.2));
  
  const blocks: TodayBlock[] = [];
  
  // Review block (if there are items)
  if (reviewItems.length > 0) {
    blocks.push({
      block_id: 'review',
      title: 'Quick Review',
      track_id: null,
      estimated_minutes: reviewBlockMinutes,
      topics: Array.from(new Set(reviewItems.map((i: ItemWithTopic) => i.topic?.name || 'Review'))),
      item_ids: reviewItems.map((i: ItemWithTopic) => i.id),
      icon: '🔄',
      color: '#6366F1',
    });
  }
  
  const remainingMinutes = targetMinutes - reviewBlockMinutes;
  
  // Step 2: Build main learning blocks based on track weights
  const activeTrackIds = ['track_11plus', 'track_coding'];
  
  for (const trackId of activeTrackIds) {
    const track = trackMap.get(trackId);
    if (!track) continue;
    
    const weight = TRACK_WEIGHTS[trackId] || 0.2;
    const blockMinutes = Math.floor(remainingMinutes * weight / 0.85); // Normalize for main tracks
    
    // Get items for this track
    const items = await queryItemsForBlock(learnerId, trackId, blockMinutes);
    
    if (items.length > 0) {
      blocks.push({
        block_id: `${trackId}_main`,
        title: `${track.name} Focus`,
        track_id: trackId,
        estimated_minutes: blockMinutes,
        topics: Array.from(new Set(items.map((i: ItemWithTopic) => i.topic?.name || 'Practice'))),
        item_ids: items.map((i: ItemWithTopic) => i.id),
        icon: track.icon,
        color: track.color,
      });
    }
  }
  
  // Step 3: Optionally add enrichment blocks (lighter tracks)
  // Only on certain days to keep variety
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 3 || dayOfWeek === 6) { // Wednesday or Saturday
    const enrichmentTrack = dayOfWeek === 3 ? 'track_animation' : 'track_digital_health';
    const track = trackMap.get(enrichmentTrack);
    
    if (track) {
      const enrichmentItems = await queryItemsForBlock(learnerId, enrichmentTrack, 15);
      
      if (enrichmentItems.length > 0) {
        blocks.push({
          block_id: `${enrichmentTrack}_enrichment`,
          title: track.name,
          track_id: enrichmentTrack,
          estimated_minutes: 15,
          topics: Array.from(new Set(enrichmentItems.map((i: ItemWithTopic) => i.topic?.name || 'Explore'))),
          item_ids: enrichmentItems.map((i: ItemWithTopic) => i.id),
          icon: track.icon,
          color: track.color,
        });
      }
    }
  }
  
  return {
    date: dateStr,
    total_minutes_target: targetMinutes,
    blocks,
    greeting: getGreeting(),
  };
}

async function queryItemsForBlock(
  learnerId: string,
  trackId: string,
  targetMinutes: number
) {
  // Estimate ~2-3 minutes per item
  const estimatedItems = Math.ceil(targetMinutes / 2.5);
  
  // Get learner's mastery states for this track
  const masteryStates = await prisma.masteryState.findMany({
    where: {
      learnerId,
      trackId,
    },
  });
  
  const masteryMap = new Map(masteryStates.map((m: MasteryStateRecord) => [m.topicId, m]));
  
  // Strategy: Mix of topics in different mastery states
  // 40% from learning/practising topics (areas needing work)
  // 40% from nearly_there topics (reinforcement)
  // 20% from new topics (introduction)
  
  const learningTopicIds = masteryStates
    .filter((m: MasteryStateRecord) => ['learning', 'practising'].includes(m.masteryStatus))
    .map((m: MasteryStateRecord) => m.topicId);
  
  const nearlyThereTopicIds = masteryStates
    .filter((m: MasteryStateRecord) => m.masteryStatus === 'nearly_there')
    .map((m: MasteryStateRecord) => m.topicId);
  
  const allTopics = await prisma.topic.findMany({
    where: { trackId },
    select: { id: true },
  });
  
  const knownTopicIds = new Set(masteryStates.map((m: MasteryStateRecord) => m.topicId));
  const newTopicIds = allTopics
    .filter((t: { id: string }) => !knownTopicIds.has(t.id))
    .map((t: { id: string }) => t.id);
  
  // Build item query
  const items = await prisma.item.findMany({
    where: {
      trackId,
      OR: [
        { topicId: { in: learningTopicIds } },
        { topicId: { in: nearlyThereTopicIds } },
        { topicId: { in: newTopicIds.slice(0, 3) } }, // Limit new topics
      ],
    },
    include: {
      topic: true,
      subject: true,
    },
    take: estimatedItems * 2, // Get more than needed for variety
  });
  
  // Shuffle and limit
  const shuffled = items.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, estimatedItems);
}

export async function getBlockItems(blockId: string, itemIds: string[]) {
  return prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    include: {
      topic: true,
      subject: true,
      track: true,
    },
  });
}
