import { NextRequest, NextResponse } from 'next/server';
import { getMasteryStates } from '@/services/mastery';
import { requireAuth } from '@/lib/auth';

interface MasteryStateWithRelations {
  topicId: string;
  subjectId: string;
  trackId: string;
  masteryStatus: string;
  rag: string;
  percentCorrect: number;
  attemptsCount: number;
  lastUpdatedAt: Date;
  topic: { name: string; level: string };
  subject: { name: string };
  track: { name: string };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  try {
    await requireAuth();
    
    const { learnerId } = await params;
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    
    const masteryStates = await getMasteryStates(learnerId, trackId, subjectId);
    
    // Transform to a cleaner response format
    const response = masteryStates.map((state: MasteryStateWithRelations) => ({
      topic_id: state.topicId,
      topic_name: state.topic.name,
      subject_id: state.subjectId,
      subject_name: state.subject.name,
      track_id: state.trackId,
      track_name: state.track.name,
      level: state.topic.level,
      mastery_status: state.masteryStatus,
      rag: state.rag,
      percent_correct: state.percentCorrect,
      attempts_count: state.attemptsCount,
      last_updated_at: state.lastUpdatedAt,
    }));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching mastery states:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch mastery states' },
      { status: 500 }
    );
  }
}
