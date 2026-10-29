import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import Event from '@/models/Event';
import { generateTotpSecret, getTotpKeyUri, generateQrDataUrl, verifyTotpCode } from '@/lib/totp';
import { hashPassword, signSetupTotp, verifySetupTotp, signSession } from '@/lib/auth';
import { adminSetupSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const count = await Admin.countDocuments();
    if (count > 0) {
      return NextResponse.json({ setupDone: true });
    }

    const activeEvent = await Event.findOne({ isActive: true });
    const eventName = activeEvent?.name || 'Hackathon';

    const secret = generateTotpSecret();
    const keyuri = getTotpKeyUri('admin', `${eventName} Admin`, secret);
    const qrDataUrl = await generateQrDataUrl(keyuri);

    const setupToken = await signSetupTotp(secret, 'admin');

    const response = NextResponse.json({
      setupDone: false,
      qrDataUrl,
      secretBase32: secret,
    });

    const isHttps = request.url.startsWith('https://');

    response.cookies.set('setup_totp', setupToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Setup GET error:', error);
    return NextResponse.json({ error: 'Failed to inspect setup status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Permanent refusal once an admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return NextResponse.json({ error: 'Setup is already completed.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = adminSetupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { username, password, code } = validation.data;

    const setupCookie = request.cookies.get('setup_totp')?.value;
    if (!setupCookie) {
      return NextResponse.json(
        { error: 'Setup session expired. Please refresh the page and try again.' },
        { status: 400 }
      );
    }

    const setupPayload = await verifySetupTotp(setupCookie);
    if (!setupPayload || !setupPayload.secret) {
      return NextResponse.json(
        { error: 'Invalid or expired setup token. Please refresh.' },
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(code, setupPayload.secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 6-digit TOTP code. Ensure your authenticator device clock is synced.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = await Admin.create({
      username: username.toLowerCase().trim(),
      passwordHash,
      totpSecret: setupPayload.secret,
      totpEnabled: true,
      failedAttempts: 0,
    });

    const sessionToken = await signSession(
      {
        sub: newAdmin._id.toString(),
        role: 'admin',
        name: newAdmin.username,
        ver: 0,
      },
      '8h'
    );

    const response = NextResponse.json({
      success: true,
      message: 'Admin account created successfully.',
    });

    const isHttps = request.url.startsWith('https://');

    // Clear setup cookie and set session cookie
    response.cookies.delete('setup_totp');
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Setup POST error:', error);
    return NextResponse.json({ error: 'Failed to complete admin setup' }, { status: 500 });
  }
}
