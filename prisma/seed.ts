// Database Seed Script for Ziggy Alpha Hub
// Run with: npm run db:seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TrackSpec {
  track_id: string;
  name: string;
  description: string;
  time_priority: 'exam_critical' | 'core_skill' | 'enrichment';
  default_weekly_minutes: number;
  icon: string;
  color: string;
  subjects: Array<{
    subject_id: string;
    name: string;
    description?: string;
    icon?: string;
  }>;
  topics: Array<{
    topic_id: string;
    subject_id: string;
    name: string;
    description?: string;
    level: 'foundation' | 'intermediate' | 'advanced';
    prerequisites: string[];
    mastery_rules: {
      min_recent_attempts: number;
      min_accuracy: number;
      min_days_span: number;
    };
    tags: string[];
  }>;
}

interface ItemData {
  track_id: string;
  subject_id: string;
  topic_id: string;
  type_id: string;
  difficulty: number;
  payload: object;
}

async function loadTrackSpec(filename: string): Promise<TrackSpec> {
  const filePath = path.join(__dirname, 'seed-data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

async function loadItems(): Promise<ItemData[]> {
  const filePath = path.join(__dirname, 'seed-data', 'items.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

async function seedTrack(spec: TrackSpec) {
  console.log(`📚 Seeding track: ${spec.name}`);

  // Create track
  await prisma.track.upsert({
    where: { id: spec.track_id },
    update: {
      name: spec.name,
      description: spec.description,
      timePriority: spec.time_priority,
      defaultWeeklyMinutes: spec.default_weekly_minutes,
      icon: spec.icon,
      color: spec.color,
      configJson: spec as object,
    },
    create: {
      id: spec.track_id,
      name: spec.name,
      description: spec.description,
      timePriority: spec.time_priority,
      defaultWeeklyMinutes: spec.default_weekly_minutes,
      icon: spec.icon,
      color: spec.color,
      configJson: spec as object,
    },
  });

  // Create subjects
  for (let i = 0; i < spec.subjects.length; i++) {
    const subject = spec.subjects[i];
    await prisma.subject.upsert({
      where: { id: subject.subject_id },
      update: {
        name: subject.name,
        description: subject.description,
        icon: subject.icon || '📖',
        sortOrder: i,
      },
      create: {
        id: subject.subject_id,
        trackId: spec.track_id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon || '📖',
        sortOrder: i,
      },
    });
  }

  // Create topics
  for (let i = 0; i < spec.topics.length; i++) {
    const topic = spec.topics[i];
    await prisma.topic.upsert({
      where: { id: topic.topic_id },
      update: {
        name: topic.name,
        description: topic.description,
        level: topic.level,
        prerequisites: topic.prerequisites,
        masteryRules: topic.mastery_rules,
        tags: topic.tags,
        sortOrder: i,
      },
      create: {
        id: topic.topic_id,
        trackId: spec.track_id,
        subjectId: topic.subject_id,
        name: topic.name,
        description: topic.description,
        level: topic.level,
        prerequisites: topic.prerequisites,
        masteryRules: topic.mastery_rules,
        tags: topic.tags,
        sortOrder: i,
      },
    });
  }

  console.log(`  ✅ Created ${spec.subjects.length} subjects and ${spec.topics.length} topics`);
}

async function seedItems(items: ItemData[]) {
  console.log(`📝 Seeding ${items.length} items...`);

  for (const item of items) {
    await prisma.item.create({
      data: {
        trackId: item.track_id,
        subjectId: item.subject_id,
        topicId: item.topic_id,
        typeId: item.type_id,
        difficulty: item.difficulty,
        payload: item.payload,
      },
    });
  }

  console.log(`  ✅ Created ${items.length} items`);
}

async function seedUsers() {
  console.log('👤 Seeding users...');

  // Create parent user (Joseph)
  const hashedPassword = await bcrypt.hash('ziggy2024', 12);
  
  const parentUser = await prisma.user.upsert({
    where: { email: 'joseph@ziggyalpha.com' },
    update: {},
    create: {
      email: 'joseph@ziggyalpha.com',
      hashedPassword,
      role: 'parent',
    },
  });

  // Create learner (Ziggy)
  const examDate = new Date();
  examDate.setMonth(examDate.getMonth() + 10); // 10 months from now

  await prisma.learner.upsert({
    where: { id: 'ziggy-learner-1' },
    update: {
      displayName: 'Ziggy',
      avatarEmoji: '🌟',
      examDate,
    },
    create: {
      id: 'ziggy-learner-1',
      parentId: parentUser.id,
      displayName: 'Ziggy',
      avatarEmoji: '🌟',
      dateOfBirth: new Date('2015-06-15'),
      examDate,
      timezone: 'Europe/London',
    },
  });

  console.log('  ✅ Created parent (Joseph) and learner (Ziggy)');
  console.log(`  📧 Login: joseph@ziggyalpha.com / ziggy2024`);
}

async function seedLightTracks() {
  console.log('🎨 Seeding light tracks (Animation & Digital Health)...');

  // Animation Track (light version)
  await prisma.track.upsert({
    where: { id: 'track_animation' },
    update: {},
    create: {
      id: 'track_animation',
      name: 'Animation',
      description: 'Learn digital art and basic animation skills',
      timePriority: 'enrichment',
      defaultWeeklyMinutes: 60,
      icon: '🎨',
      color: '#F59E0B',
    },
  });

  await prisma.subject.upsert({
    where: { id: 'animation_basics' },
    update: {},
    create: {
      id: 'animation_basics',
      trackId: 'track_animation',
      name: 'Animation Basics',
      description: 'Foundational animation concepts',
      icon: '🎬',
    },
  });

  await prisma.topic.upsert({
    where: { id: 'anim_drawing_basics' },
    update: {},
    create: {
      id: 'anim_drawing_basics',
      trackId: 'track_animation',
      subjectId: 'animation_basics',
      name: 'Drawing Basics',
      description: 'Learn the fundamentals of digital drawing',
      level: 'foundation',
      prerequisites: [],
      masteryRules: { min_recent_attempts: 3, min_accuracy: 0.8, min_days_span: 1 },
      tags: ['drawing', 'basics'],
    },
  });

  // Digital Health Track (light version)
  await prisma.track.upsert({
    where: { id: 'track_digital_health' },
    update: {},
    create: {
      id: 'track_digital_health',
      name: 'Digital Health',
      description: 'Health literacy and digital wellbeing',
      timePriority: 'enrichment',
      defaultWeeklyMinutes: 30,
      icon: '💚',
      color: '#10B981',
    },
  });

  await prisma.subject.upsert({
    where: { id: 'wellbeing' },
    update: {},
    create: {
      id: 'wellbeing',
      trackId: 'track_digital_health',
      name: 'Digital Wellbeing',
      description: 'Healthy habits for screen time',
      icon: '🧘',
    },
  });

  await prisma.topic.upsert({
    where: { id: 'health_screen_time' },
    update: {},
    create: {
      id: 'health_screen_time',
      trackId: 'track_digital_health',
      subjectId: 'wellbeing',
      name: 'Screen Time Balance',
      description: 'Understanding healthy screen habits',
      level: 'foundation',
      prerequisites: [],
      masteryRules: { min_recent_attempts: 2, min_accuracy: 0.8, min_days_span: 1 },
      tags: ['screen', 'balance', 'health'],
    },
  });

  console.log('  ✅ Created Animation and Digital Health tracks');
}

async function main() {
  console.log('🚀 Starting Ziggy Alpha Hub database seed...\n');

  try {
    // Seed tracks from TrackSpecs
    const track11plus = await loadTrackSpec('track-11plus.json');
    await seedTrack(track11plus);

    const trackCoding = await loadTrackSpec('track-coding.json');
    await seedTrack(trackCoding);

    // Seed light tracks
    await seedLightTracks();

    // Seed items
    const items = await loadItems();
    await seedItems(items);

    // Seed users
    await seedUsers();

    console.log('\n✨ Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
