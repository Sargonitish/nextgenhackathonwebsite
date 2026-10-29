import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Announcement from '@/models/Announcement';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();
    if (!activeEvent) {
      return NextResponse.json({ announcements: [] });
    }

    const announcements = await Announcement.find({ eventId: activeEvent._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Public Announcements error:', error);
    return NextResponse.json({ announcements: [] }, { status: 500 });
  }
}
