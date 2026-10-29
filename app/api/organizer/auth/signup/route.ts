import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import Organizer from '@/models/Organizer';
import { hashPassword } from '@/lib/auth';
import { organizerSignupSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendAdminNotification } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limit: 50 requests per IP per minute
    const rateCheck = await checkRateLimit(`org-signup:${ip}`, 50, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many application attempts. Please wait an hour.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Check honeypot
    if (body.hpField) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    const validation = organizerSignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid form input' },
        { status: 400 }
      );
    }

    const data = validation.data;

    await connectDB();
    const activeEvent = await Event.findOne({ isActive: true, isArchived: false }).lean();

    if (!activeEvent?.settings?.organizerSignupOpen) {
      return NextResponse.json(
        { error: 'Organizer applications are currently closed.' },
        { status: 403 }
      );
    }

    // Verify passcode if configured
    if (activeEvent.settings?.organizerSignupCode) {
      const expectedCode = activeEvent.settings.organizerSignupCode.trim();
      const submittedCode = (data.signupCode || '').trim();

      const expectedBuf = Buffer.from(expectedCode);
      const submittedBuf = Buffer.from(submittedCode);

      if (
        expectedBuf.length !== submittedBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, submittedBuf)
      ) {
        return NextResponse.json(
          { error: 'Invalid organizer sign-up access passcode.' },
          { status: 403 }
        );
      }
    }

    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    const [existingUsername, existingEmail] = await Promise.all([
      Organizer.findOne({ username: cleanUsername }),
      Organizer.findOne({ email: cleanEmail }),
    ]);

    if (existingUsername) {
      return NextResponse.json(
        { error: `Username "${data.username}" is already taken.` },
        { status: 409 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: `Email address "${data.email}" is already registered.` },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const newOrganizer = await Organizer.create({
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      college: data.college.trim(),
      department: data.department.trim(),
      yearOrDesignation: data.yearOrDesignation.trim(),
      type: data.type,
      duty: data.duty,
      note: data.note?.trim() || '',
      photoUrl: null,
      username: cleanUsername,
      passwordHash,
      status: 'pending',
      permissions: {
        checkin: true,
        viewTeams: true,
        viewContacts: false,
      },
      showOnWebsite: false,
      sessionVersion: 0,
      failedAttempts: 0,
      submittedIp: ip,
      checkinsDone: 0,
    });

    // Notify admin by email
    const subject = `[HackX Alert] New Organizer Request: ${newOrganizer.name}`;
    const emailBody = `
      <h3>New Organizer Access Request</h3>
      <p><strong>Name:</strong> ${newOrganizer.name}</p>
      <p><strong>Email:</strong> ${newOrganizer.email}</p>
      <p><strong>Phone:</strong> ${newOrganizer.phone}</p>
      <p><strong>Duty Preference:</strong> ${newOrganizer.duty}</p>
      <p><strong>College/Dept:</strong> ${newOrganizer.college} - ${newOrganizer.department}</p>
      <p><strong>Assigned Note:</strong> ${newOrganizer.note || 'None'}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/organizers">Review in Admin Panel</a></p>
    `;
    await sendAdminNotification(subject, emailBody);

    return NextResponse.json({
      success: true,
      message: 'Request submitted! You can log in once the admin approves your request.',
    });
  } catch (error: any) {
    console.error('Organizer signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit organizer application' },
      { status: 500 }
    );
  }
}
