import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const search = searchParams.get('search')?.trim();
    const track = searchParams.get('track')?.trim();
    const checkedInParam = searchParams.get('checkedIn');

    const event = eventId
      ? await Event.findById(eventId).lean()
      : await Event.findOne({ isActive: true }).lean();

    if (!event) {
      return NextResponse.json({ teams: [], total: 0, pages: 0 });
    }

    const query: any = { eventId: event._id };

    if (track) {
      query.track = track;
    }

    if (checkedInParam === 'true') {
      query.checkedIn = true;
    } else if (checkedInParam === 'false') {
      query.checkedIn = false;
    }

    if (search) {
      query.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamId: { $regex: search, $options: 'i' } },
        { leaderEmail: { $regex: search, $options: 'i' } },
        { 'members.name': { $regex: search, $options: 'i' } },
        { 'members.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [teams, total] = await Promise.all([
      Team.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Team.countDocuments(query),
    ]);

    return NextResponse.json({
      teams,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin teams fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
