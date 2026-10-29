import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const targetEvent = await Event.findById(params.id);
    if (!targetEvent) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    if (targetEvent.isArchived) {
      return NextResponse.json(
        { error: 'Cannot activate an archived event. Unarchive it first.' },
        { status: 400 }
      );
    }

    // Two-step atomic update ensuring strictly ONE active event
    await Event.updateMany({}, { isActive: false });
    targetEvent.isActive = true;
    await targetEvent.save();

    return NextResponse.json({
      success: true,
      message: `Edition "${targetEvent.name}" is now the active live event.`,
      event: targetEvent,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Activate Event Error:', error);
    return NextResponse.json({ error: 'Failed to activate event' }, { status: 500 });
  }
}
