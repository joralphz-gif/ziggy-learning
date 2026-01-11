import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Create parent user
    const hashedPassword = await bcrypt.hash('ziggy2024', 10);
    
    const parent = await prisma.user.upsert({
      where: { email: 'joseph@ziggyalpha.com' },
      update: {},
      create: {
        email: 'joseph@ziggyalpha.com',
        hashedPassword,
        role: 'parent',
      },
    });

    // Create learner
    const examDate = new Date();
    examDate.setMonth(examDate.getMonth() + 10);

    await prisma.learner.upsert({
      where: { id: 'ziggy-learner-1' },
      update: {},
      create: {
        id: 'ziggy-learner-1',
        parentId: parent.id,
        displayName: 'Ziggy',
        examDate,
        avatarEmoji: '🌟',
      },
    });

    // Create tracks
    await prisma.track.upsert({
      where: { id: '11plus' },
      update: {},
      create: {
        id: '11plus',
        name: '11+ Preparation',
        description: 'Complete 11+ exam preparation',
        timePriority: 'exam_critical',
        defaultWeeklyMinutes: 300,
        icon: '🎯',
        color: '#3B82F6',
      },
    });

    await prisma.track.upsert({
      where: { id: 'coding' },
      update: {},
      create: {
        id: 'coding',
        name: 'Python Coding',
        description: 'Learn Python programming',
        timePriority: 'core_skill',
        defaultWeeklyMinutes: 120,
        icon: '🐍',
        color: '#10B981',
      },
    });

    // Create subjects
    await prisma.subject.upsert({
      where: { id: 'maths' },
      update: {},
      create: {
        id: 'maths',
        trackId: '11plus',
        name: 'Mathematics',
        icon: '🔢',
        sortOrder: 1,
      },
    });

    await prisma.subject.upsert({
      where: { id: 'english' },
      update: {},
      create: {
        id: 'english',
        trackId: '11plus',
        name: 'English',
        icon: '📝',
        sortOrder: 2,
      },
    });

    await prisma.subject.upsert({
      where: { id: 'python_core' },
      update: {},
      create: {
        id: 'python_core',
        trackId: 'coding',
        name: 'Python Core',
        icon: '🐍',
        sortOrder: 1,
      },
    });

    // Create topics
    await prisma.topic.upsert({
      where: { id: 'place_value' },
      update: {},
      create: {
        id: 'place_value',
        trackId: '11plus',
        subjectId: 'maths',
        name: 'Place Value',
        level: 'foundation',
        sortOrder: 1,
      },
    });

    await prisma.topic.upsert({
      where: { id: 'fractions' },
      update: {},
      create: {
        id: 'fractions',
        trackId: '11plus',
        subjectId: 'maths',
        name: 'Fractions',
        level: 'foundation',
        sortOrder: 2,
      },
    });

    await prisma.topic.upsert({
      where: { id: 'vocabulary' },
      update: {},
      create: {
        id: 'vocabulary',
        trackId: '11plus',
        subjectId: 'english',
        name: 'Vocabulary',
        level: 'foundation',
        sortOrder: 1,
      },
    });

    await prisma.topic.upsert({
      where: { id: 'variables' },
      update: {},
      create: {
        id: 'variables',
        trackId: 'coding',
        subjectId: 'python_core',
        name: 'Variables & Types',
        level: 'foundation',
        sortOrder: 1,
      },
    });

    // Create sample items
    await prisma.item.upsert({
      where: { id: 'item-1' },
      update: {},
      create: {
        id: 'item-1',
        trackId: '11plus',
        subjectId: 'maths',
        topicId: 'place_value',
        typeId: 'mcq',
        difficulty: 2,
        payload: {
          question: 'What is the value of 7 in 3,742?',
          options: ['7', '70', '700', '7000'],
          correctIndex: 2,
          explanation: 'The 7 is in the hundreds place, so its value is 700.',
        },
      },
    });

    await prisma.item.upsert({
      where: { id: 'item-2' },
      update: {},
      create: {
        id: 'item-2',
        trackId: '11plus',
        subjectId: 'maths',
        topicId: 'fractions',
        typeId: 'mcq',
        difficulty: 2,
        payload: {
          question: 'What is 1/2 + 1/4?',
          options: ['1/6', '2/6', '3/4', '2/4'],
          correctIndex: 2,
          explanation: '1/2 = 2/4, so 2/4 + 1/4 = 3/4',
        },
      },
    });

    await prisma.item.upsert({
      where: { id: 'item-3' },
      update: {},
      create: {
        id: 'item-3',
        trackId: '11plus',
        subjectId: 'english',
        topicId: 'vocabulary',
        typeId: 'mcq',
        difficulty: 2,
        payload: {
          question: 'What does "benevolent" mean?',
          options: ['Evil', 'Kind and generous', 'Angry', 'Sad'],
          correctIndex: 1,
          explanation: 'Benevolent means kind, generous, and caring.',
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Database seeded!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
