import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Team from '@/models/Team';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('admin');
    await connectDB();

    const events = await Event.find({}).sort({ createdAt: -1 }).lean();

    // Attach registered teams count to each edition
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const teamsCount = await Team.countDocuments({ eventId: ev._id });
        return {
          ...ev,
          teamsCount,
        };
      })
    );

    return NextResponse.json({ events: eventsWithStats });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch Events Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const { action, name, slug, teamIdPrefix, sourceEventId } = body;

    if (!name || !slug || !teamIdPrefix) {
      return NextResponse.json(
        { error: 'Name, Slug, and Team ID Prefix are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await Event.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { error: `An edition with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    if (action === 'clone' && sourceEventId) {
      const source = await Event.findById(sourceEventId).lean();
      if (!source) {
        return NextResponse.json({ error: 'Source event to clone not found' }, { status: 404 });
      }

      // Clone everything except _id, teams, timer runtime
      const clonedEvent = new Event({
        ...source,
        _id: undefined,
        name: name.trim(),
        slug: cleanSlug,
        teamIdPrefix: teamIdPrefix.toUpperCase().trim(),
        isActive: false,
        isArchived: false,
        timer: {
          scheduledStart: null,
          durationMs: source.timer?.durationMs || 86400000,
          status: 'not_started',
          startedAt: null,
          pausedAt: null,
          totalPausedMs: 0,
        },
        createdAt: undefined,
        updatedAt: undefined,
      });

      await clonedEvent.save();
      return NextResponse.json({
        success: true,
        message: 'Edition cloned successfully',
        event: clonedEvent,
      });
    }

    // Create blank edition
    const newEvent = new Event({
      name: name.trim(),
      slug: cleanSlug,
      teamIdPrefix: teamIdPrefix.toUpperCase().trim(),
      isActive: false,
      isArchived: false,
      branding: {
        primaryColor: '#00ff9d',
        accentColor: '#7c3aed',
        sections: {
          hero: true,
          about: true,
          tracks: true,
          schedule: true,
          prizes: true,
          rules: true,
          coordinators: true,
          organizers: true,
          sponsors: true,
          gallery: true,
          faq: true,
          venue: true,
          contact: true,
        },
      },
      content: {
        heroTitle: name.trim(),
        heroTagline: '24 Hours of Code, Innovation & Midnight Building',
        typingWords: ['Build', 'Innovate', 'Disrupt', 'Ship'],
        aboutTitle: `About ${name.trim()}`,
        aboutText: 'The annual flagship college hackathon.',
        rulesText: '### General Rules\n- 2-4 members per team.',
        venueName: 'Campus Auditorium',
        venueAddress: 'College Campus Road',
        contactEmail: 'contact@college.edu',
        contactPhone: '+91 9876543210',
        socials: {},
      },
      timer: {
        scheduledStart: null,
        durationMs: 86400000,
        status: 'not_started',
        startedAt: null,
        pausedAt: null,
        totalPausedMs: 0,
      },
      settings: {
        registrationOpen: true,
        registrationDeadline: null,
        maxTeams: 100,
        minTeamSize: 2,
        maxTeamSize: 4,
        organizerSignupOpen: true,
        organizerSignupCode: null,
      },
      coordinators: [],
      tracks: [],
      schedule: [],
      prizes: [],
      sponsors: [],
      gallery: [],
      faqs: [],
    });

    await newEvent.save();
    return NextResponse.json({
      success: true,
      message: 'New blank edition created successfully',
      event: newEvent,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create Event Error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
