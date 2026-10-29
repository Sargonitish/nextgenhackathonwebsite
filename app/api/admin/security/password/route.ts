import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { requireRole, hashPassword, comparePassword } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const { currentPassword, newPassword, totpCode } = body;

    if (!currentPassword || !newPassword || !totpCode) {
      return NextResponse.json(
        { error: 'Current password, new password, and 2FA code are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(user.id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Verify current 2FA TOTP code
    const isTotpValid = verifyTotpCode(totpCode, admin.totpSecret);
    if (!isTotpValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA authenticator code' },
        { status: 400 }
      );
    }

    // Update password
    admin.passwordHash = await hashPassword(newPassword);
    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin master password updated successfully',
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update master password' },
      { status: 500 }
    );
  }
}
