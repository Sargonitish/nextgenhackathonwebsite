import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const event = await Event.findOne({ isActive: true, isArchived: false })
      .select('name slug teamIdPrefix branding settings tracks schedule content.heroTitle content.heroTagline')
      .lean();

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Public site config error:', error);
    return NextResponse.json({ event: null }, { status: 500 });
  }
}
