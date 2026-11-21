import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL: JWT_SECRET environment variable is missing in production.'); })()
    : 'hackathon-fallback-secret-minimum-32-chars-long'
);
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

interface JWTSession {
  sub: string;
  role: 'admin' | 'organizer';
  name: string;
  ver: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Explicitly allow public authentication & onboarding routes
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/setup' ||
    pathname.startsWith('/api/admin/auth/') ||
    pathname === '/organizer/login' ||
    pathname === '/organizer/signup' ||
    pathname.startsWith('/api/organizer/auth/') ||
    pathname.startsWith('/api/public/')
  ) {
    return NextResponse.next();
  }

  // 2. Determine target route protection level
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isOrganizerPath =
    (pathname.startsWith('/organizer') && !pathname.startsWith('/organizer/login') && !pathname.startsWith('/organizer/signup')) ||
    pathname.startsWith('/api/organizer');
  const isStaffPath = pathname === '/checkin' || pathname.startsWith('/checkin/') || pathname.startsWith('/api/staff');

  if (!isAdminPath && !isOrganizerPath && !isStaffPath) {
    return NextResponse.next();
  }

  // 3. Inspect session cookie
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return handleUnauthenticated(request, pathname, isAdminPath);
  }

  try {
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    const session = payload as unknown as JWTSession;

    if (!session || !session.role) {
      return handleUnauthenticated(request, pathname, isAdminPath);
    }

    // Role-based authorization
    if (isAdminPath) {
      if (session.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(pathname)}`, request.url));
      }
      return NextResponse.next();
    }

    if (isOrganizerPath) {
      if (session.role !== 'organizer') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL(`/organizer/login?next=${encodeURIComponent(pathname)}`, request.url));
      }
      return NextResponse.next();
    }

    if (isStaffPath) {
      if (session.role !== 'admin' && session.role !== 'organizer') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Staff access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL(`/organizer/login?next=${encodeURIComponent(pathname)}`, request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch {
    return handleUnauthenticated(request, pathname, isAdminPath);
  }
}

function handleUnauthenticated(request: NextRequest, pathname: string, isAdminPath: boolean) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized: Session missing or expired' }, { status: 401 });
  }

  const loginUrl = isAdminPath ? '/admin/login' : '/organizer/login';
  const redirectUrl = new URL(loginUrl, request.url);
  redirectUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/organizer/:path*',
    '/api/organizer/:path*',
    '/checkin',
    '/checkin/:path*',
    '/api/staff/:path*',
  ],
};
