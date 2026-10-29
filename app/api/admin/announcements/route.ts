import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Announcement from '@/models/Announcement';
import { requireRole } from '@/lib/auth';

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
      return NextResponse.json({ announcements: [] });
    }

    const announcements = await Announcement.find({ eventId: event._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ announcements });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const { eventId, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const event = eventId
      ? await Event.findById(eventId)
      : await Event.findOne({ isActive: true });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const newAnnouncement = await Announcement.create({
      eventId: event._id,
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      announcement: newAnnouncement,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    await Announcement.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Announcement deleted' });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
