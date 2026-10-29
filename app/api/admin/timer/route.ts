import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { requireRole } from '@/lib/auth';
import { timerActionSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const validation = timerActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid timer action parameters' },
        { status: 400 }
      );
    }

    const { eventId, action, value, scheduledStart } = validation.data;
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    const timer = event.timer || {
      scheduledStart: null,
      durationMs: 86400000,
      status: 'not_started',
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
    };

    const now = new Date();

    switch (action) {
      case 'start':
        // Start running immediately
        timer.status = 'running';
        timer.startedAt = now;
        timer.pausedAt = null;
        timer.totalPausedMs = 0;
        break;

      case 'pause':
        if (timer.status !== 'running') {
          return NextResponse.json(
            { error: 'Cannot pause timer: timer is not running.' },
            { status: 400 }
          );
        }
        timer.status = 'paused';
        timer.pausedAt = now;
        break;

      case 'resume':
        if (timer.status !== 'paused') {
          return NextResponse.json(
            { error: 'Cannot resume timer: timer is not paused.' },
            { status: 400 }
          );
        }
        if (timer.pausedAt) {
          timer.totalPausedMs += now.getTime() - new Date(timer.pausedAt).getTime();
        }
        timer.status = 'running';
        timer.pausedAt = null;
        break;

      case 'extend':
        if (!value || value <= 0) {
          return NextResponse.json(
            { error: 'Please specify a positive extension duration in milliseconds.' },
            { status: 400 }
          );
        }
        timer.durationMs += value;
        break;

      case 'end':
        timer.status = 'ended';
        break;

      case 'reset':
        timer.status = 'not_started';
        timer.startedAt = null;
        timer.pausedAt = null;
        timer.totalPausedMs = 0;
        break;

      case 'schedule':
        if (scheduledStart) {
          timer.scheduledStart = new Date(scheduledStart);
        }
        if (value && value > 0) {
          timer.durationMs = value;
        }
        break;

      default:
        return NextResponse.json({ error: 'Unsupported timer action' }, { status: 400 });
    }

    event.timer = timer;
    await event.save();

    return NextResponse.json({
      success: true,
      message: `Timer action "${action}" executed successfully.`,
      timer: event.timer,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Timer action error:', error);
    return NextResponse.json({ error: 'Failed to update timer state' }, { status: 500 });
  }
}
