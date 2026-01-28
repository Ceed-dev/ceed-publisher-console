import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, getSessionCookieOptions } from '@/lib/auth/session';

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
