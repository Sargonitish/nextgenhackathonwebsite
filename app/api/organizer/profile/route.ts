import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Organizer from '@/models/Organizer';
import { requireRole, hashPassword, comparePassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('organizer');
    const organizer = user.organizerDoc;

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    return NextResponse.json({
      organizer: {
        id: organizer._id.toString(),
        name: organizer.name,
        email: organizer.email,
        phone: organizer.phone,
        college: organizer.college,
        department: organizer.department,
        yearOrDesignation: organizer.yearOrDesignation,
        type: organizer.type,
        duty: organizer.duty,
        note: organizer.note,
        photoUrl: organizer.photoUrl,
        username: organizer.username,
        permissions: organizer.permissions,
        status: organizer.status,
        checkinsDone: organizer.checkinsDone,
        createdAt: organizer.createdAt,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole('organizer');
    const organizer = user.organizerDoc!;

    const body = await request.json();
    const { name, phone, photoUrl, currentPassword, newPassword } = body;

    await connectDB();
    const doc = await Organizer.findById(organizer._id);
    if (!doc) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    if (name && typeof name === 'string' && name.trim()) {
      doc.name = name.trim();
    }
    if (phone && typeof phone === 'string' && phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          { error: 'Phone must be a valid 10-digit number' },
          { status: 400 }
        );
      }
      doc.phone = cleanPhone;
    }
    if (photoUrl !== undefined) {
      doc.photoUrl = photoUrl;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }
      const match = await comparePassword(currentPassword, doc.passwordHash);
      if (!match) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      doc.passwordHash = await hashPassword(newPassword);
    }

    await doc.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      organizer: {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        college: doc.college,
        department: doc.department,
        yearOrDesignation: doc.yearOrDesignation,
        type: doc.type,
        duty: doc.duty,
        photoUrl: doc.photoUrl,
        username: doc.username,
        permissions: doc.permissions,
        status: doc.status,
        checkinsDone: doc.checkinsDone,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
