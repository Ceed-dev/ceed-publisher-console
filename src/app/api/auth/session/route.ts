/**
 * @fileoverview Session Creation Endpoint
 *
 * Exchanges a Firebase ID token for a server-side session cookie.
 * This endpoint is called after successful Firebase Authentication.
 *
 * @route POST /api/auth/session
 * @authenticated Firebase ID token required
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, getSessionCookieOptions } from '@/lib/auth/session';

/**
 * Create a new session from Firebase ID token
 *
 * @description
 * Verifies the Firebase ID token and creates a secure HTTP-only
 * session cookie for subsequent authenticated requests.
 *
 * @param request - Request containing { idToken: string }
 * @returns Success response with session cookie set
 *
 * @throws 400 - Missing ID token
 * @throws 401 - Invalid ID token or session creation failed
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    const sessionCookie = await createSessionCookie(idToken);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieOptions.name, sessionCookie, {
      maxAge: cookieOptions.maxAge,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite,
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}
