import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ registeredTeamsCount: 0 });
    }

    const count = await Team.countDocuments({ eventId: activeEvent._id });
    return NextResponse.json({ registeredTeamsCount: count });
  } catch (error) {
    console.error('Public stats error:', error);
    return NextResponse.json({ registeredTeamsCount: 0 }, { status: 500 });
  }
}
