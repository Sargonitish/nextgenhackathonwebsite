import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import connectDB from './db';
import Admin, { IAdmin } from '@/models/Admin';
import Organizer, { IOrganizer } from '@/models/Organizer';

const JWT_SECRET_STRING = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL: JWT_SECRET environment variable is missing in production.'); })()
    : 'hackathon-fallback-secret-minimum-32-chars-long'
);
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: 'admin' | 'organizer';
  name: string;
  ver: number;
}

export interface PreAuthPayload extends JWTPayload {
  adminId: string;
  stage: '2fa';
}

export interface SetupTotpPayload extends JWTPayload {
  secret: string;
  username: string;
}

// ----------------- Password Hashing -----------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const comparePassword = verifyPassword;

// ----------------- JWT Token Signing -----------------

export async function signSession(
  payload: { sub: string; role: 'admin' | 'organizer'; name: string; ver: number },
  expiresIn: string = '8h'
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function signPreAuth(adminId: string): Promise<string> {
  return new SignJWT({ adminId, stage: '2fa' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET);
}

export async function verifyPreAuth(token: string): Promise<PreAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.stage !== '2fa' || !payload.adminId) return null;
    return payload as unknown as PreAuthPayload;
  } catch {
    return null;
  }
}

export async function signSetupTotp(secret: string, username: string): Promise<string> {
  return new SignJWT({ secret, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(JWT_SECRET);
}

export async function verifySetupTotp(token: string): Promise<SetupTotpPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.secret) return null;
    return payload as unknown as SetupTotpPayload;
  } catch {
    return null;
  }
}

// ----------------- Role Requirement & Session Guard -----------------

export interface AuthenticatedUser {
  id: string;
  role: 'admin' | 'organizer';
  name: string;
  adminDoc?: IAdmin;
  organizerDoc?: IOrganizer;
}

export async function requireRole(
  expectedRole: 'admin' | 'organizer' | 'staff'
): Promise<AuthenticatedUser> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    throw new Error('UNAUTHORIZED');
  }

  const payload = await verifySession(sessionCookie);
  if (!payload || !payload.sub || !payload.role) {
    throw new Error('UNAUTHORIZED');
  }

  // Check role match
  if (expectedRole === 'admin' && payload.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  if (expectedRole === 'organizer' && payload.role !== 'organizer') {
    throw new Error('FORBIDDEN');
  }
  if (expectedRole === 'staff' && payload.role !== 'admin' && payload.role !== 'organizer') {
    throw new Error('FORBIDDEN');
  }

  await connectDB();

  if (payload.role === 'admin') {
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      throw new Error('UNAUTHORIZED');
    }
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      throw new Error('ACCOUNT_LOCKED');
    }
    return {
      id: admin._id.toString(),
      role: 'admin',
      name: admin.username,
      adminDoc: admin,
    };
  }

  if (payload.role === 'organizer') {
    const organizer = await Organizer.findById(payload.sub);
    if (!organizer) {
      throw new Error('UNAUTHORIZED');
    }
    if (organizer.status !== 'approved') {
      throw new Error('ORGANIZER_NOT_APPROVED');
    }
    // Instant session invalidation check
    if (organizer.sessionVersion !== payload.ver) {
      throw new Error('SESSION_REVOKED');
    }
    if (organizer.lockUntil && organizer.lockUntil > new Date()) {
      throw new Error('ACCOUNT_LOCKED');
    }
    return {
      id: organizer._id.toString(),
      role: 'organizer',
      name: organizer.name,
      organizerDoc: organizer,
    };
  }

  throw new Error('UNAUTHORIZED');
}
