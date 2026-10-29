import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('organizer');
    await connectDB();

    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({
        totalTeams: 0,
        checkedIn: 0,
        remaining: 0,
        tracksData: [],
        registrationOpen: false,
      });
    }

    const [totalTeams, checkedIn] = await Promise.all([
      Team.countDocuments({ eventId: activeEvent._id }),
      Team.countDocuments({ eventId: activeEvent._id, checkedIn: true }),
    ]);

    // Aggregate counts per track
    const trackAggregation = await Team.aggregate([
      { $match: { eventId: activeEvent._id } },
      { $group: { _id: '$track', count: { $sum: 1 } } },
    ]);

    const tracksData = (activeEvent.tracks || []).map((t) => {
      const found = trackAggregation.find((a) => a._id === t.title);
      return {
        title: t.title,
        count: found ? found.count : 0,
      };
    });

    return NextResponse.json({
      eventName: activeEvent.name,
      totalTeams,
      checkedIn,
      remaining: Math.max(0, totalTeams - checkedIn),
      tracksData,
      registrationOpen: activeEvent.settings?.registrationOpen ?? true,
      organizerName: user.name,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
