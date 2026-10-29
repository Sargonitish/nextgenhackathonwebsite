import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginLog from '@/models/LoginLog';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));

    const logs = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ logs });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
}
