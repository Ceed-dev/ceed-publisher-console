import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getMember,
  getMemberByUserAndOrg,
  updateMemberRole,
  removeMember,
  countOwners,
} from '@/lib/db/members';
import { memberUpdateSchema } from '@/lib/validations/member';
import { createAuditLog } from '@/lib/db/audit-logs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await params;

  try {
    const targetMember = await getMember(memberId);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const currentMember = await getMemberByUserAndOrg(user.uid, targetMember.orgId);
    if (!currentMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (currentMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can update member roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = memberUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    if (targetMember.role === 'owner' && validation.data.role !== 'owner') {
      const ownerCount = await countOwners(targetMember.orgId);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner' },
          { status: 400 }
        );
      }
    }

    await updateMemberRole(memberId, validation.data.role);

    await createAuditLog({
      orgId: targetMember.orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'member.update',
      resourceType: 'member',
      resourceId: memberId,
      changes: {
        role: { before: targetMember.role, after: validation.data.role },
      },
    });

    const updatedMember = await getMember(memberId);
    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Failed to update member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await params;

  try {
    const targetMember = await getMember(memberId);
    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const currentMember = await getMemberByUserAndOrg(user.uid, targetMember.orgId);
    if (!currentMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (currentMember.role !== 'owner' && currentMember.memberId !== memberId) {
      return NextResponse.json(
        { error: 'Only owners can remove members' },
        { status: 403 }
      );
    }

    if (targetMember.role === 'owner') {
      const ownerCount = await countOwners(targetMember.orgId);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner' },
          { status: 400 }
        );
      }
    }

    await removeMember(memberId);

    await createAuditLog({
      orgId: targetMember.orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'member.remove',
      resourceType: 'member',
      resourceId: memberId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
