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
    const { leaderEmail, phone, googleToken, googleId, verifiedEmail } = body;

    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 });
    }

    let team = null;

    // 1. Google Token Lookup
    if (googleToken) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(googleToken)}`
      );
      if (verifyRes.ok) {
        const tokenData = await verifyRes.json();
        const cleanEmail = (tokenData.email || '').toLowerCase().trim();
        const subId = tokenData.sub;

        team = await Team.findOne({
          eventId: activeEvent._id,
          $or: [
            { leaderEmail: cleanEmail },
            { leaderGoogleId: subId },
            { 'members.email': cleanEmail },
          ],
        }).lean();
      }
    }

    // 2. Persistent Google Session Ticket Sync (googleId + verifiedEmail)
    if (!team && googleId && verifiedEmail) {
      const cleanEmail = String(verifiedEmail).toLowerCase().trim();
      team = await Team.findOne({
        eventId: activeEvent._id,
        $or: [
          { leaderGoogleId: String(googleId) },
          { leaderEmail: cleanEmail },
          { 'members.email': cleanEmail },
        ],
      }).lean();
    }

    // 3. Standard Email + Phone Lookup
    if (!team && leaderEmail && phone) {
      const cleanEmail = leaderEmail.toLowerCase().trim();
      const cleanPhone = phone.trim();

      team = await Team.findOne({
        eventId: activeEvent._id,
        leaderEmail: cleanEmail,
        'members.phone': cleanPhone,
      }).lean();
    }

    if (!team) {
      return NextResponse.json(
        { error: 'No matching team ticket found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      teamId: team.teamId,
      teamName: team.teamName,
      token: team.checkinToken,
    });
  } catch (error) {
    console.error('Find registration error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
