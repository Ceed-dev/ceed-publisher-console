import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getMemberByInviteToken,
  acceptInvitation,
  getMemberByUserAndOrg,
} from '@/lib/db/members';
import { createAuditLog } from '@/lib/db/audit-logs';
import { Timestamp } from 'firebase-admin/firestore';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    if (user.email?.toLowerCase() !== member.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Email mismatch. Please sign in with the invited email address.',
          code: 'EMAIL_MISMATCH',
          expectedEmail: member.email,
        },
        { status: 403 }
      );
    }

    const existingMembership = await getMemberByUserAndOrg(
      user.uid,
      member.orgId
    );
    if (existingMembership && existingMembership.memberId !== member.memberId) {
      return NextResponse.json(
        { error: 'You are already a member of this organization', code: 'ALREADY_MEMBER' },
        { status: 400 }
      );
    }

    await acceptInvitation(member.memberId, user.uid, user.displayName || undefined);

    await createAuditLog({
      orgId: member.orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'member.accept_invite',
      resourceType: 'member',
      resourceId: member.memberId,
    });

    return NextResponse.json({
      success: true,
      orgId: member.orgId,
    });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
