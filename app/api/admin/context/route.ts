import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Organizer from '@/models/Organizer';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireRole('admin');
    await connectDB();

    const [events, pendingOrganizersCount] = await Promise.all([
      Event.find({}).select('_id name slug isActive isArchived').sort({ createdAt: -1 }).lean(),
      Organizer.countDocuments({ status: 'pending' }),
    ]);

    return NextResponse.json({
      admin: { name: auth.name },
      events,
      pendingOrganizersCount,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    console.error('Admin Context Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin context' }, { status: 500 });
  }
}
