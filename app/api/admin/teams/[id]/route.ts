import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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

    const team = await Team.findById(params.id).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve team' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole('admin');
    await connectDB();

    const team = await Team.findByIdAndDelete(params.id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" (${team.teamId}) deleted successfully`,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
