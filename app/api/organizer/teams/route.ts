import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';
import { getActiveEvent } from '@/lib/activeEvent';
import { toOrganizerTeamView } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('organizer');
    const organizer = user.organizerDoc;

    if (!organizer?.permissions?.viewTeams) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view teams.' },
        { status: 403 }
      );
    }

    await connectDB();
    const event = await getActiveEvent();
    if (!event) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const track = searchParams.get('track')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all'; // all | checkedIn | pending
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { eventId: event._id };

    if (track && track !== 'all') {
      filter.track = track;
    }

    if (status === 'checkedIn') {
      filter.checkedIn = true;
    } else if (status === 'pending') {
      filter.checkedIn = false;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { teamId: searchRegex },
        { teamName: searchRegex },
        { 'members.name': searchRegex },
      ];
    }

    const total = await Team.countDocuments(filter);
    const rawTeams = await Team.find(filter)
      .populate('checkedInBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const teams = rawTeams.map((t) =>
      toOrganizerTeamView(t, organizer.permissions)
    );

    return NextResponse.json({
      teams,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error.message === 'SESSION_REVOKED') {
      return NextResponse.json({ error: 'Session revoked' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
