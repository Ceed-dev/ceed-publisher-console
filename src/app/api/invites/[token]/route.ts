import { NextRequest, NextResponse } from 'next/server';
import { getMemberByInviteToken } from '@/lib/db/members';
import { getOrganization } from '@/lib/db/organizations';
import { Timestamp } from 'firebase-admin/firestore';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const member = await getMemberByInviteToken(token);

    if (!member) {
      return NextResponse.json(
        { error: 'Invalid invitation', code: 'INVALID_TOKEN' },
        { status: 404 }
      );
    }

    if (member.status === 'active') {
      return NextResponse.json(
        { error: 'Invitation already accepted', code: 'ALREADY_ACCEPTED' },
        { status: 400 }
      );
    }

    if (member.inviteExpiresAt) {
      const expiresAt =
        member.inviteExpiresAt instanceof Timestamp
          ? member.inviteExpiresAt.toDate()
          : new Date(
              (member.inviteExpiresAt as { seconds: number }).seconds * 1000
            );
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Invitation has expired', code: 'EXPIRED' },
          { status: 400 }
        );
      }
    }

    const org = await getOrganization(member.orgId);

    return NextResponse.json({
      invitation: {
        email: member.email,
        role: member.role,
        orgName: org?.name || 'Unknown Organization',
        orgId: member.orgId,
      },
    });
  } catch (error) {
    console.error('Failed to validate invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
