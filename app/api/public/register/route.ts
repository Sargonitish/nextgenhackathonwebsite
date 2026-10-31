import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import Counter from '@/models/Counter';
import { teamRegistrationSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limit: 5 registrations per IP per 10 minutes
    const rateCheck = await checkRateLimit(`register:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Check honeypot for spam bot detection
    if (body.honeypot) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    const validation = teamRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid form data' },
        { status: 400 }
      );
    }

    const { teamName, track, members, leaderGoogleId, isGoogleVerified, googleAvatar } = validation.data;

    await connectDB();
    const event = await Event.findOne({ isActive: true, isArchived: false });
    if (!event) {
      return NextResponse.json(
        { error: 'No active hackathon edition currently accepting registrations.' },
        { status: 400 }
      );
    }

    // Server-side Gate Checks
    if (!event.settings?.registrationOpen) {
      return NextResponse.json(
        { error: 'Registration is currently closed for this edition.' },
        { status: 403 }
      );
    }

    if (
      event.settings?.registrationDeadline &&
      new Date() > new Date(event.settings.registrationDeadline)
    ) {
      return NextResponse.json(
        { error: 'The registration deadline has passed.' },
        { status: 403 }
      );
    }

    // Check team size against settings
    const minSize = event.settings?.minTeamSize ?? 2;
    const maxSize = event.settings?.maxTeamSize ?? 4;
    if (members.length < minSize || members.length > maxSize) {
      return NextResponse.json(
        { error: `Team size must be between ${minSize} and ${maxSize} members.` },
        { status: 400 }
      );
    }

    // Check maxTeams capacity cap
    if (event.settings?.maxTeams) {
      const currentTeamCount = await Team.countDocuments({ eventId: event._id });
      if (currentTeamCount >= event.settings.maxTeams) {
        return NextResponse.json(
          { error: 'Maximum team capacity has been reached for this hackathon.' },
          { status: 403 }
        );
      }
    }

    const leader = members[0];
    const leaderEmail = leader.email.toLowerCase().trim();
    const teamNameLower = teamName.toLowerCase().trim();

    // Check teamName and leaderEmail uniqueness within event
    const [existingName, existingLeader] = await Promise.all([
      Team.findOne({ eventId: event._id, teamNameLower }),
      Team.findOne({ eventId: event._id, leaderEmail }),
    ]);

    if (existingName) {
      return NextResponse.json(
        { error: `Team name "${teamName}" is already registered. Please pick a unique name.` },
        { status: 409 }
      );
    }

    if (existingLeader) {
      return NextResponse.json(
        { error: `Leader email "${leaderEmail}" has already registered a team for this event.` },
        { status: 409 }
      );
    }

    // Generate atomic sequential Team ID
    const counterDoc = await Counter.findOneAndUpdate(
      { _id: `team:${event._id.toString()}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const prefix = event.teamIdPrefix || 'HACKX';
    const seqPadded = String(counterDoc.seq).padStart(4, '0');
    const teamId = `${prefix}-${seqPadded}`;

    // Cryptographically secure checkin token
    const checkinToken = crypto.randomBytes(16).toString('hex');

    // Build member records with leader tag
    const formattedMembers = members.map((m, index) => ({
      name: m.name.trim(),
      email: m.email.toLowerCase().trim(),
      phone: m.phone.trim(),
      college: m.college.trim(),
      department: m.department.trim(),
      year: m.year,
      isLeader: index === 0,
      present: false,
    }));

    const newTeam = await Team.create({
      eventId: event._id,
      teamId,
      teamName: teamName.trim(),
      teamNameLower,
      track: track.trim(),
      members: formattedMembers,
      leaderEmail,
      leaderGoogleId: leaderGoogleId || undefined,
      isGoogleVerified: Boolean(isGoogleVerified),
      googleAvatar: googleAvatar || undefined,
      checkinToken,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
    });

    return NextResponse.json({
      success: true,
      teamId: newTeam.teamId,
      token: checkinToken,
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Failed to process team registration. Please check your data and retry.' },
      { status: 500 }
    );
  }
}
