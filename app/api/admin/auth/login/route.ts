import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import LoginLog from '@/models/LoginLog';
import { verifyPassword, signPreAuth } from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Rate limit: 10 attempts per IP per 5 minutes
    const rateCheck = await checkRateLimit(`login:ip:${ip}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const { username, password } = validation.data;
    await connectDB();

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    // Handle unknown user with dummy timing to prevent enumeration timing attacks
    if (!admin) {
      await verifyPassword(password, '$2a$12$e8Yk1m3d8sK6V5lZ9m1K1.1111111111111111111111111111111');
      await LoginLog.create({
        username: username.toLowerCase().trim(),
        role: 'admin',
        ip,
        userAgent,
        success: false,
        reason: 'User not found',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check account lockout
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account locked due to multiple failed attempts. Try again in ${waitMinutes} minute(s).` },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      admin.failedAttempts = (admin.failedAttempts || 0) + 1;
      if (admin.failedAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await admin.save();

      await LoginLog.create({
        username: admin.username,
        role: 'admin',
        ip,
        userAgent,
        success: false,
        reason: 'Incorrect password',
      });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Password is valid -> generate pre_auth token for step 2 (TOTP)
    const preAuthToken = await signPreAuth(admin._id.toString());

    const response = NextResponse.json({
      success: true,
      next: 'totp',
      message: 'Password accepted. Enter your 2FA code.',
    });

    const isHttps = request.url.startsWith('https://');

    response.cookies.set('pre_auth', preAuthToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during login' }, { status: 500 });
  }
}
