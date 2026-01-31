import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getMember,
  getMemberByUserAndOrg,
  updateInviteToken,
} from '@/lib/db/members';
import { getOrganization } from '@/lib/db/organizations';
import { sendInviteEmail } from '@/lib/db/mail';
import { createAuditLog } from '@/lib/db/audit-logs';

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memberId } = await params;

    const member = await getMember(memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const currentMember = await getMemberByUserAndOrg(user.uid, member.orgId);
    if (!currentMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (currentMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can resend invitations' },
        { status: 403 }
      );
    }

    if (member.status === 'active') {
      return NextResponse.json(
        { error: 'Member has already accepted the invitation' },
        { status: 400 }
      );
    }

    const { token } = await updateInviteToken(memberId);

    const org = await getOrganization(member.orgId);
    if (org) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await sendInviteEmail({
        to: member.email,
        inviterEmail: user.email || '',
        orgName: org.name,
        inviteToken: token,
        baseUrl,
      });
    }

    await createAuditLog({
      orgId: member.orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'member.resend_invite',
      resourceType: 'member',
      resourceId: member.memberId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to resend invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}
