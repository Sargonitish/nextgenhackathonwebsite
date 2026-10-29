import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const organizers = await Organizer.find({
      status: 'approved',
      showOnWebsite: true,
    })
      .select('name type duty photoUrl')
      .lean();

    return NextResponse.json({ organizers });
  } catch (error) {
    console.error('Public Organizers error:', error);
    return NextResponse.json({ organizers: [] }, { status: 500 });
  }
}
