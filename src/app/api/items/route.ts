import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const {
      track_id,
      subject_ids,
      topic_ids,
      max_items = 10,
      difficulty_min,
      difficulty_max,
    } = body;
    
    const items = await prisma.item.findMany({
      where: {
        ...(track_id && { trackId: track_id }),
        ...(subject_ids?.length && { subjectId: { in: subject_ids } }),
        ...(topic_ids?.length && { topicId: { in: topic_ids } }),
        ...(difficulty_min && { difficulty: { gte: difficulty_min } }),
        ...(difficulty_max && { difficulty: { lte: difficulty_max } }),
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        track: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      take: max_items,
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error querying items:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to query items' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const itemIds = searchParams.get('ids')?.split(',') || [];
    
    if (itemIds.length === 0) {
      return NextResponse.json([]);
    }
    
    const items = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
      },
      include: {
        topic: true,
        subject: true,
        track: true,
      },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}
