import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import Organizer from '@/models/Organizer';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event');

    const event = eventId
      ? await Event.findById(eventId).lean()
      : await Event.findOne({ isActive: true }).lean();

    if (!event) {
      return NextResponse.json({
        totalTeams: 0,
        todayTeams: 0,
        checkedInTeams: 0,
        registrationOpen: false,
        pendingOrganizers: 0,
        tracksData: [],
        timelineData: [],
        recentTeams: [],
        timer: null,
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalTeams, todayTeams, checkedInTeams, pendingOrganizers, teams] = await Promise.all([
      Team.countDocuments({ eventId: event._id }),
      Team.countDocuments({ eventId: event._id, createdAt: { $gte: todayStart } }),
      Team.countDocuments({ eventId: event._id, checkedIn: true }),
      Organizer.countDocuments({ status: 'pending' }),
      Team.find({ eventId: event._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('teamId teamName track leaderEmail checkedIn createdAt')
        .lean(),
    ]);

    // Aggregate teams per track
    const trackAggregation = await Team.aggregate([
      { $match: { eventId: event._id } },
      { $group: { _id: '$track', count: { $sum: 1 } } },
    ]);

    const tracksData = (event.tracks || []).map((t) => {
      const match = trackAggregation.find((agg) => agg._id === t.title);
      return {
        track: t.title.split(' ')[0] || t.title, // shortened label for chart
        fullName: t.title,
        count: match ? match.count : 0,
      };
    });

    // Registrations by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const timelineAggregation = await Team.aggregate([
      { $match: { eventId: event._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format 7 days list
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = timelineAggregation.find((a) => a._id === key);
      timelineData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: found ? found.count : 0,
      });
    }

    return NextResponse.json({
      totalTeams,
      todayTeams,
      checkedInTeams,
      registrationOpen: event.settings?.registrationOpen ?? true,
      pendingOrganizers,
      tracksData,
      timelineData,
      recentTeams: teams,
      timer: event.timer,
      eventName: event.name,
      eventId: event._id,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 });
  }
}
