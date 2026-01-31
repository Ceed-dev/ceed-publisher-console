/**
 * @fileoverview Session Logout Endpoint
 *
 * Clears the session cookie to log the user out.
 *
 * @route POST /api/auth/logout
 */

import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/auth/session';

/**
 * Clear session and log user out
 *
 * @description
 * Removes the session cookie by setting it to an empty value
 * with an immediate expiration.
 *
 * @returns Success response with cleared session cookie
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(getSessionCookieName(), '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}
