import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';

const SESSION_COOKIE_NAME = '__session';
const SESSION_EXPIRY_DAYS = 5;

export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  const expiresIn = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  return sessionCookie;
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<{ uid: string; email: string; displayName?: string } | null> {
  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || '',
      displayName: decodedClaims.name,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<{ uid: string; email: string; displayName?: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return verifySessionCookie(sessionCookie);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax' as const,
  };
}
