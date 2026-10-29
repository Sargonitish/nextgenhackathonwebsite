import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { requireRole, signSetupTotp, verifySetupTotp } from '@/lib/auth';
import { generateTotpSecret, getTotpKeyUri, generateQrDataUrl, verifyTotpCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

// GET: Start re-enrollment, generate new secret & QR
export async function GET() {
  try {
    const user = await requireRole('admin');

    const secret = generateTotpSecret();
    const keyuri = getTotpKeyUri(user.name, 'HackX Platform', secret);
    const qrDataUrl = await generateQrDataUrl(keyuri);
    const setupToken = await signSetupTotp(secret, user.name);

    return NextResponse.json({
      secret,
      qrDataUrl,
      setupToken,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to initiate 2FA reset' }, { status: 500 });
  }
}

// POST: Verify 6-digit code with the new secret and update admin record
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    await connectDB();

    const body = await request.json();
    const { code, setupToken } = body;

    if (!code || !setupToken) {
      return NextResponse.json(
        { error: 'Verification code and setup token are required' },
        { status: 400 }
      );
    }

    const payload = await verifySetupTotp(setupToken);
    if (!payload || !payload.secret) {
      return NextResponse.json(
        { error: 'Setup session expired. Please regenerate QR code.' },
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(code, payload.secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 6-digit authenticator code. Check clock and re-enter.' },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(user.id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    admin.totpSecret = payload.secret;
    admin.totpEnabled = true;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: '2FA Authenticator reset successfully! Use your new app profile for future logins.',
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to verify 2FA reset' }, { status: 500 });
  }
}
