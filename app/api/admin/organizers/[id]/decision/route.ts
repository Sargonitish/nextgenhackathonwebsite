import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';
import { requireRole, hashPassword } from '@/lib/auth';
import { organizerDecisionSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const validation = organizerDecisionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid decision parameters' },
        { status: 400 }
      );
    }

    const { action, duty, permissions, showOnWebsite, reason } = validation.data;
    const organizer = await Organizer.findById(params.id);

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        organizer.status = 'approved';
        organizer.approvedAt = new Date();
        organizer.approvedBy = admin.name;
        if (duty) organizer.duty = duty;
        if (permissions) organizer.permissions = permissions;
        if (showOnWebsite !== undefined) organizer.showOnWebsite = showOnWebsite;
        break;

      case 'reject':
        if (!reason || !reason.trim()) {
          return NextResponse.json(
            { error: 'A rejection reason is required so the organizer is informed.' },
            { status: 400 }
          );
        }
        organizer.status = 'rejected';
        organizer.rejectReason = reason.trim();
        break;

      case 'suspend':
        organizer.status = 'suspended';
        // Bump sessionVersion immediately invalidating all active organizer sessions
        organizer.sessionVersion = (organizer.sessionVersion || 0) + 1;
        break;

      case 'reactivate':
        organizer.status = 'approved';
        break;

      case 'reset-password': {
        const tempPassword = `hx_${crypto.randomBytes(4).toString('hex')}!A`;
        organizer.passwordHash = await hashPassword(tempPassword);
        organizer.sessionVersion = (organizer.sessionVersion || 0) + 1;
        await organizer.save();

        return NextResponse.json({
          success: true,
          message: 'Temporary password generated successfully.',
          tempPassword,
        });
      }

      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    await organizer.save();

    return NextResponse.json({
      success: true,
      message: `Organizer action "${action}" completed successfully.`,
      organizer,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Organizer decision error:', error);
    return NextResponse.json({ error: 'Failed to process organizer decision' }, { status: 500 });
  }
}
