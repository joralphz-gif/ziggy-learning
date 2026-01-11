import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface LearnerType {
  id: string;
  displayName: string;
  avatarEmoji: string;
  examDate: Date | null;
}

interface TrackType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface MasteryStateType {
  trackId: string;
  masteryStatus: string;
  rag: string;
}

interface AttemptType {
  trackId: string;
  timestamp: Date;
  isCorrect: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    const user = await requireAuth(['parent']);
    const { parentId } = await params;
    
    // Verify the parent is requesting their own data
    if (user.id !== parentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get learners for this parent
    const learners = await prisma.learner.findMany({
      where: { parentId },
    });
    
    const learnerOverviews = await Promise.all(
      learners.map(async (learner: LearnerType) => {
        // Get all tracks
        const tracks = await prisma.track.findMany();
        
        // Get mastery states for this learner
        const masteryStates = await prisma.masteryState.findMany({
          where: { learnerId: learner.id },
        });
        
        // Get recent attempts for activity tracking
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentAttempts = await prisma.attempt.findMany({
          where: {
            learnerId: learner.id,
            timestamp: { gte: oneWeekAgo },
          },
        });
        
        // Calculate per-track stats
        const trackOverviews = tracks.map((track: TrackType) => {
          const trackMastery = masteryStates.filter((m: MasteryStateType) => m.trackId === track.id);
          const trackAttempts = recentAttempts.filter((a: AttemptType) => a.trackId === track.id);
          
          // Estimate minutes (assume ~2 min per attempt)
          const minutesThisWeek = trackAttempts.length * 2;
          
          return {
            track_id: track.id,
            track_name: track.name,
            icon: track.icon,
            color: track.color,
            mastered_topics: trackMastery.filter((m: MasteryStateType) => m.masteryStatus === 'mastered').length,
            total_topics: trackMastery.length,
            red_topics: trackMastery.filter((m: MasteryStateType) => m.rag === 'red').length,
            amber_topics: trackMastery.filter((m: MasteryStateType) => m.rag === 'amber').length,
            green_topics: trackMastery.filter((m: MasteryStateType) => m.rag === 'green').length,
            minutes_this_week: minutesThisWeek,
            last_activity: trackAttempts.length > 0 
              ? trackAttempts.sort((a: AttemptType, b: AttemptType) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
              : null,
          };
        });
        
        return {
          learner_id: learner.id,
          display_name: learner.displayName,
          avatar_emoji: learner.avatarEmoji,
          exam_date: learner.examDate,
          tracks: trackOverviews,
          total_attempts_this_week: recentAttempts.length,
          accuracy_this_week: recentAttempts.length > 0
            ? recentAttempts.filter((a: AttemptType) => a.isCorrect).length / recentAttempts.length
            : 0,
        };
      })
    );
    
    return NextResponse.json({
      learners: learnerOverviews,
    });
  } catch (error) {
    console.error('Error fetching parent overview:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch overview' },
      { status: 500 }
    );
  }
}
