import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const token = searchParams.get('token');

    if (!teamId || !token) {
      return NextResponse.json(
        { error: 'Missing team identifier or verification token' },
        { status: 400 }
      );
    }

    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ error: 'No active event' }, { status: 404 });
    }

    const team = await Team.findOne({
      eventId: activeEvent._id,
      teamId: teamId.toUpperCase().trim(),
    }).lean();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Cryptographic timingSafeEqual verification
    const tokenBuf = Buffer.from(token.trim());
    const expectedBuf = Buffer.from(team.checkinToken);

    if (
      tokenBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(tokenBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 });
    }

    // Return safe fields
    return NextResponse.json({
      team: {
        teamId: team.teamId,
        teamName: team.teamName,
        track: team.track,
        checkedIn: team.checkedIn,
        members: team.members.map((m) => ({
          name: m.name,
          college: m.college,
          department: m.department,
          year: m.year,
          isLeader: m.isLeader,
        })),
      },
    });
  } catch (error) {
    console.error('Team Lookup error:', error);
    return NextResponse.json({ error: 'Failed to retrieve team' }, { status: 500 });
  }
}
