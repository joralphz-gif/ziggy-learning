import { NextRequest, NextResponse } from 'next/server';
import { generateTodayPlan } from '@/services/planner';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ learnerId: string }> }
) {
  try {
    await requireAuth();
    
    const { learnerId } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    const date = dateStr ? new Date(dateStr) : new Date();
    
    const plan = await generateTodayPlan(learnerId, date);
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error generating today plan:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate today plan' },
      { status: 500 }
    );
  }
}
