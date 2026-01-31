import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getMembersByOrg, getMemberByUserAndOrg, inviteMember } from '@/lib/db/members';
import { memberInviteSchema } from '@/lib/validations/member';
import { createAuditLog } from '@/lib/db/audit-logs';
import { sendInviteEmail } from '@/lib/db/mail';
import { getOrganization } from '@/lib/db/organizations';

export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  try {
    const member = await getMemberByUserAndOrg(user.uid, orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await getMembersByOrg(orgId);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orgId, ...memberData } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const currentMember = await getMemberByUserAndOrg(user.uid, orgId);
    if (!currentMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (currentMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can invite members' },
        { status: 403 }
      );
    }

    const validation = memberInviteSchema.safeParse(memberData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existingMembers = await getMembersByOrg(orgId);
    const existingMember = existingMembers.find(
      (m) => m.email === validation.data.email
    );
    if (existingMember) {
      if (existingMember.status === 'active') {
        return NextResponse.json(
          { error: 'Member already exists in this organization' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'A pending invitation already exists for this email. Use resend to send a new invitation.' },
        { status: 400 }
      );
    }

    const member = await inviteMember(
      orgId,
      validation.data.email,
      validation.data.role,
      user.uid
    );

    const org = await getOrganization(orgId);
    if (org && member.inviteToken) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await sendInviteEmail({
        to: member.email,
        inviterEmail: user.email || '',
        orgName: org.name,
        inviteToken: member.inviteToken,
        baseUrl,
      });
    }

    await createAuditLog({
      orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'member.invite',
      resourceType: 'member',
      resourceId: member.memberId,
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Failed to invite member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}
