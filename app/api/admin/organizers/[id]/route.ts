import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const organizer = await Organizer.findById(params.id).lean();
    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    return NextResponse.json({ organizer });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve organizer' }, { status: 500 });
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
    const organizer = await Organizer.findById(params.id);
    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    // Allowed editable fields
    if (body.name) organizer.name = body.name.trim();
    if (body.phone) organizer.phone = body.phone.trim();
    if (body.college) organizer.college = body.college.trim();
    if (body.department) organizer.department = body.department.trim();
    if (body.duty) organizer.duty = body.duty;
    if (body.photoUrl !== undefined) organizer.photoUrl = body.photoUrl;
    if (body.permissions) organizer.permissions = body.permissions;
    if (body.showOnWebsite !== undefined) organizer.showOnWebsite = body.showOnWebsite;

    await organizer.save();

    return NextResponse.json({
      success: true,
      message: 'Organizer profile updated successfully',
      organizer,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update organizer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const organizer = await Organizer.findByIdAndDelete(params.id);
    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Organizer "${organizer.name}" deleted successfully`,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete organizer' }, { status: 500 });
  }
}
