import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('session');
  response.cookies.delete('pre_auth');
  response.cookies.delete('setup_totp');

  return response;
}
