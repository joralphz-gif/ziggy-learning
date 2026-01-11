import { NextRequest, NextResponse } from 'next/server';
import { scoreAttempt } from '@/services/scoring';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { learner_id, item_id, raw_response, time_taken_ms, test_run_id } = body;
    
    if (!learner_id || !item_id || raw_response === undefined) {
      return NextResponse.json(
        { error: 'learner_id, item_id, and raw_response are required' },
        { status: 400 }
      );
    }
    
    const result = await scoreAttempt({
      learnerId: learner_id,
      itemId: item_id,
      rawResponse: raw_response,
      timeTakenMs: time_taken_ms,
      testRunId: test_run_id,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing attempt:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Item not found') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process attempt' },
      { status: 500 }
    );
  }
}
