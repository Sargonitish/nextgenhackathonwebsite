import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const event = await Event.findById(params.id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    const teamsCount = await Team.countDocuments({ eventId: event._id });

    return NextResponse.json({
      event: {
        ...event,
        teamsCount,
      },
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch Event ID Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve event' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const { section, data } = body;

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    if (section === 'branding') {
      event.branding = { ...event.branding, ...data };
      if (data.name) event.name = data.name;
      if (data.teamIdPrefix) event.teamIdPrefix = data.teamIdPrefix.toUpperCase();
    } else if (section === 'content') {
      event.content = { ...event.content, ...data };
    } else if (section === 'settings') {
      event.settings = { ...event.settings, ...data };
    } else if (
      [
        'coordinators',
        'tracks',
        'schedule',
        'prizes',
        'sponsors',
        'gallery',
        'faqs',
      ].includes(section)
    ) {
      // List sections
      (event as any)[section] = data;
    } else if (section === 'archive') {
      event.isArchived = data.isArchived ?? true;
      if (event.isArchived) {
        event.isActive = false; // Cannot be active if archived
      }
    } else {
      return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Patch Event Error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event edition not found' }, { status: 404 });
    }

    // Must be archived
    if (!event.isArchived) {
      return NextResponse.json(
        { error: 'Cannot delete an active or unarchived event. Archive it first.' },
        { status: 400 }
      );
    }

    // Must have 0 teams
    const teamsCount = await Team.countDocuments({ eventId: event._id });
    if (teamsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete edition with ${teamsCount} registered teams.` },
        { status: 400 }
      );
    }

    await Event.deleteOne({ _id: event._id });

    return NextResponse.json({
      success: true,
      message: 'Archived edition permanently deleted',
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete Event Error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
