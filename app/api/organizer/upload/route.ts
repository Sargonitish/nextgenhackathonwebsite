import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { uploadStreamToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('organizer');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed: JPG, PNG, WebP' },
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

    const folder = `hackathon/organizers/${user.id}`;
    const result = await uploadStreamToCloudinary(buffer, folder);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
