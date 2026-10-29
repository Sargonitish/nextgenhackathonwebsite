import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();
    const search = searchParams.get('search')?.trim();

    const query: any = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    const organizers = await Organizer.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ organizers });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch organizers' }, { status: 500 });
  }
}
