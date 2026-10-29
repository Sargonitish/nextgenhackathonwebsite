import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event');

    const event = eventId
      ? await Event.findById(eventId).select('name timer isActive').lean()
      : await Event.findOne({ isActive: true, isArchived: false })
          .select('name timer isActive')
          .lean();

    if (!event) {
      return NextResponse.json({
        timer: null,
        serverNow: Date.now(),
      });
    }

    return NextResponse.json({
      eventName: event.name,
      timer: event.timer,
      serverNow: Date.now(),
    });
  } catch (error) {
    console.error('Public Timer Fetch Error:', error);
    return NextResponse.json(
      { timer: null, serverNow: Date.now() },
      { status: 500 }
    );
  }
}
