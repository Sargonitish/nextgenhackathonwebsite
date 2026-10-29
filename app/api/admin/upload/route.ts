import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { uploadStreamToCloudinary } from '@/lib/cloudinary';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const eventSlug = (formData.get('eventSlug') as string) || 'common';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed: JPG, PNG, WebP, SVG, GIF' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `hackathon/${eventSlug.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const result = await uploadStreamToCloudinary(buffer, folder);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin Upload Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
