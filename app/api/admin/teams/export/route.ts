import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';
import { exportTeamsToCsv } from '@/lib/csv';

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
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const teams = await Team.find({ eventId: event._id }).sort({ createdAt: 1 }).lean();
    const csvContent = exportTeamsToCsv(teams);

    const filename = `${event.slug || 'hackathon'}-teams-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('CSV Export Error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
