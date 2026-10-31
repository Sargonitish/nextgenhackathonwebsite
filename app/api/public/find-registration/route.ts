import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limit: 5 attempts per 10 minutes
    const rateCheck = await checkRateLimit(`find-reg:${ip}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many search attempts. Please wait 10 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { leaderEmail, phone, googleToken } = body;

    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 });
    }

    let team = null;

    // 1. Google Verified 1-Click Lookup
    if (googleToken) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleToken)}`
      );
      if (!verifyRes.ok) {
        return NextResponse.json({ error: 'Invalid Google authentication token' }, { status: 401 });
      }
      const tokenData = await verifyRes.json();
      const verifiedEmail = (tokenData.email || '').toLowerCase().trim();
      const googleId = tokenData.sub;

      team = await Team.findOne({
        eventId: activeEvent._id,
        $or: [
          { leaderEmail: verifiedEmail },
          { leaderGoogleId: googleId },
          { 'members.email': verifiedEmail },
        ],
      }).lean();

      if (!team) {
        return NextResponse.json(
          { error: `No registration pass found associated with Google account ${verifiedEmail}.` },
          { status: 404 }
        );
      }
    } else {
      // 2. Standard Email + Phone Lookup
      if (!leaderEmail || !phone) {
        return NextResponse.json(
          { error: 'Leader email and phone number are required' },
          { status: 400 }
        );
      }

      const cleanEmail = leaderEmail.toLowerCase().trim();
      const cleanPhone = phone.trim();

      team = await Team.findOne({
        eventId: activeEvent._id,
        leaderEmail: cleanEmail,
        'members.phone': cleanPhone,
      }).lean();

      if (!team) {
        return NextResponse.json(
          { error: 'No matching team found with that leader email and phone number.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      teamId: team.teamId,
      token: team.checkinToken,
    });
  } catch (error) {
    console.error('Find registration error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
