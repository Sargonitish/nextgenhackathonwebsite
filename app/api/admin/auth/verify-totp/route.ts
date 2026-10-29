import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import LoginLog from '@/models/LoginLog';
import { verifyPreAuth, signSession } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';
import { verifyTotpSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const preAuthCookie = request.cookies.get('pre_auth')?.value;
    if (!preAuthCookie) {
      return NextResponse.json(
        { error: '2FA session expired. Please enter your password again.' },
        { status: 401 }
      );
    }

    const preAuth = await verifyPreAuth(preAuthCookie);
    if (!preAuth || !preAuth.adminId) {
      return NextResponse.json(
        { error: 'Invalid or expired 2FA authorization token.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = verifyTotpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Please provide a 6-digit code' },
        { status: 400 }
      );
    }

    const { code } = validation.data;
    await connectDB();

    const admin = await Admin.findById(preAuth.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // Check account lockout
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account locked due to failed attempts. Try again in ${waitMinutes} minute(s).` },
        { status: 423 }
      );
    }

    // Verify TOTP code against admin.totpSecret
    const isValid = verifyTotpCode(code, admin.totpSecret);
    if (!isValid) {
      admin.failedAttempts = (admin.failedAttempts || 0) + 1;
      if (admin.failedAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await admin.save();

      await LoginLog.create({
        username: admin.username,
        role: 'admin',
        ip,
        userAgent,
        success: false,
        reason: 'Invalid TOTP code',
      });

      return NextResponse.json(
        { error: 'Invalid authentication code. Check your authenticator app.' },
        { status: 401 }
      );
    }

    // Success -> reset lockout count and save
    admin.failedAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    await LoginLog.create({
      username: admin.username,
      role: 'admin',
      ip,
      userAgent,
      success: true,
      reason: 'TOTP verified successfully',
    });

    const sessionToken = await signSession(
      {
        sub: admin._id.toString(),
        role: 'admin',
        name: admin.username,
        ver: 0,
      },
      '8h'
    );

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
    });

    const isHttps = request.url.startsWith('https://');

    // Delete pre_auth cookie and set session cookie
    response.cookies.delete('pre_auth');
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Verify TOTP Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred verifying 2FA' },
      { status: 500 }
    );
  }
}
