import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.credential || body.idToken;

    if (!token) {
      return NextResponse.json({ error: 'Missing Google credential token' }, { status: 400 });
    }

    // Verify token using official Google OAuth2 tokeninfo endpoint
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error_description || 'Invalid or expired Google token' },
        { status: 401 }
      );
    }

    const payload = await response.json();

    // Verify audience matches client ID if NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured
    const expectedClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '63130357409-hi1hfqt1ofc94pup9fm60ck46okmshhb.apps.googleusercontent.com';
    if (expectedClientId && payload.aud !== expectedClientId) {
      return NextResponse.json(
        { error: 'Google Client ID mismatch' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || '',
        avatar: payload.picture || '',
        emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
      },
    });
  } catch (error: any) {
    console.error('Google token verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify Google token' },
      { status: 500 }
    );
  }
}
