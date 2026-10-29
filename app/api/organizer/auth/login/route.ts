import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';
import LoginLog from '@/models/LoginLog';
import { verifyPassword, signSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Rate limit: 30 attempts per 5 minutes
    const rateCheck = await checkRateLimit(`org-login:${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Please enter your username/email and password' },
        { status: 400 }
      );
    }

    await connectDB();
    const cleanIdent = usernameOrEmail.toLowerCase().trim();

    const organizer = await Organizer.findOne({
      $or: [{ username: cleanIdent }, { email: cleanIdent }],
    });

    if (!organizer) {
      await verifyPassword(password, '$2a$12$e8Yk1m3d8sK6V5lZ9m1K1.1111111111111111111111111111111');
      await LoginLog.create({
        username: cleanIdent,
        role: 'organizer',
        ip,
        userAgent,
        success: false,
        reason: 'User not found',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check account lockout
    if (organizer.lockUntil && organizer.lockUntil > new Date()) {
      const waitMins = Math.ceil((organizer.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account locked due to failed attempts. Try again in ${waitMins} minute(s).` },
        { status: 423 }
      );
    }

    const isMatch = await verifyPassword(password, organizer.passwordHash);
    if (!isMatch) {
      organizer.failedAttempts = (organizer.failedAttempts || 0) + 1;
      if (organizer.failedAttempts >= 5) {
        organizer.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await organizer.save();

      await LoginLog.create({
        username: organizer.username,
        role: 'organizer',
        ip,
        userAgent,
        success: false,
        reason: 'Incorrect password',
      });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Password is correct. Now enforce status workflow!
    if (organizer.status === 'pending') {
      return NextResponse.json(
        { error: '⏳ Your request is waiting for admin approval.' },
        { status: 403 }
      );
    }

    if (organizer.status === 'rejected') {
      return NextResponse.json(
        {
          error: `❌ Your request was rejected: ${
            organizer.rejectReason || 'Does not match event requirements.'
          }`,
        },
        { status: 403 }
      );
    }

    if (organizer.status === 'suspended') {
      return NextResponse.json(
        { error: '🚫 Your access has been revoked. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Status is 'approved' -> reset lockout & issue 12h session token
    organizer.failedAttempts = 0;
    organizer.lockUntil = null;
    organizer.lastLoginAt = new Date();
    await organizer.save();

    await LoginLog.create({
      username: organizer.username,
      role: 'organizer',
      ip,
      userAgent,
      success: true,
      reason: 'Organizer authenticated successfully',
    });

    const sessionToken = await signSession(
      {
        sub: organizer._id.toString(),
        role: 'organizer',
        name: organizer.name,
        ver: organizer.sessionVersion || 0,
      },
      '12h'
    );

    const response = NextResponse.json({
      success: true,
      message: 'Welcome back! Redirecting to Organizer Portal...',
    });

    const isHttps = request.url.startsWith('https://');

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Organizer login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
