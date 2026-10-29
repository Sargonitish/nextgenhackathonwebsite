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
    const { leaderEmail, phone } = body;

    if (!leaderEmail || !phone) {
      return NextResponse.json(
        { error: 'Leader email and phone number are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ error: 'No active event found' }, { status: 404 });
    }

    const cleanEmail = leaderEmail.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const team = await Team.findOne({
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
