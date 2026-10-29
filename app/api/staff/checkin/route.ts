import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import Organizer from '@/models/Organizer';
import { requireRole } from '@/lib/auth';
import { toOrganizerTeamView } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('staff');
    await connectDB();

    // Verify organizer permission if role is organizer
    if (user.role === 'organizer' && user.organizerDoc) {
      if (!user.organizerDoc.permissions?.checkin) {
        return NextResponse.json(
          { error: 'Forbidden: Check-in scanner access not granted by administrator.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { action, teamId, token, presentMemberIds } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 });
    }

    const team = await Team.findOne({
      eventId: activeEvent._id,
      teamId: teamId.toUpperCase().trim(),
    });

    if (!team) {
      return NextResponse.json(
        { error: `Team "${teamId}" not found in current active hackathon.` },
        { status: 404 }
      );
    }

    // Step 1: Lookup
    if (action === 'lookup') {
      // If token provided (from QR scan), verify timing-safe
      if (token) {
        const tokenBuf = Buffer.from(token.trim());
        const expectedBuf = Buffer.from(team.checkinToken);
        if (
          tokenBuf.length !== expectedBuf.length ||
          !crypto.timingSafeEqual(tokenBuf, expectedBuf)
        ) {
          return NextResponse.json({ error: 'Invalid QR verification token.' }, { status: 403 });
        }
      }

      // Check attendance status
      const isAlreadyCheckedIn = team.checkedIn;

      // Project fields based on role
      const teamPayload =
        user.role === 'admin'
          ? team
          : toOrganizerTeamView(team, user.organizerDoc?.permissions);

      return NextResponse.json({
        team: teamPayload,
        isAlreadyCheckedIn,
        checkedInAt: team.checkedInAt,
        checkedInBy: team.checkedInBy,
      });
    }

    // Step 2: Confirm Check-In
    if (action === 'confirm') {
      const now = new Date();
      team.checkedIn = true;
      team.checkedInAt = team.checkedInAt || now;
      team.checkedInBy = {
        id: user.id,
        name: user.name,
        role: user.role,
      };

      // Update present state per member
      const presentList: string[] = Array.isArray(presentMemberIds) ? presentMemberIds : [];
      team.members.forEach((m: any) => {
        const mId = m._id?.toString();
        m.present = presentList.includes(mId);
      });

      await team.save();

      // If user is organizer, increment their checkinsDone counter
      if (user.role === 'organizer') {
        await Organizer.findByIdAndUpdate(user.id, { $inc: { checkinsDone: 1 } });
      }

      return NextResponse.json({
        success: true,
        message: `Team ${team.teamId} successfully checked in!`,
        teamId: team.teamId,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    console.error('Checkin API error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
