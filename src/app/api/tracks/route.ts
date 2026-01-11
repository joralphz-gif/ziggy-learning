import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface SubjectType {
  id: string;
  name: string;
  icon: string;
}

interface TrackWithRelations {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  timePriority: string;
  defaultWeeklyMinutes: number;
  subjects: SubjectType[];
  _count: { topics: number };
}

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        subjects: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { topics: true },
        },
      },
      orderBy: { timePriority: 'asc' },
    });
    
    const response = tracks.map((track: TrackWithRelations) => ({
      id: track.id,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      time_priority: track.timePriority,
      default_weekly_minutes: track.defaultWeeklyMinutes,
      subjects: track.subjects.map((s: SubjectType) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
      })),
      topic_count: track._count.topics,
    }));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}
