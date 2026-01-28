import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(getSessionCookieName(), '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}
