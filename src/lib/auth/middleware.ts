import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from './session';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
}

export async function withAuth(
  request: NextRequest,
  handler: (user: AuthenticatedUser, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return handler(user, request);
}

export async function requireAuth(): Promise<AuthenticatedUser | null> {
  return getSessionFromCookies();
}
