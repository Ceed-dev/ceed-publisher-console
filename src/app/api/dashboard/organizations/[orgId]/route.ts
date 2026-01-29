import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getOrganization, updateOrganization } from '@/lib/db/organizations';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { organizationCreateSchema } from '@/lib/validations/organization';

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    // Check user is member of this org
    const member = await getMemberByUserAndOrg(user.uid, orgId);
    if (!member) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    const organization = await getOrganization(orgId);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    // Check user is owner of this org
    const member = await getMemberByUserAndOrg(user.uid, orgId);
    if (!member || member.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can update organization settings' }, { status: 403 });
    }

    const body = await request.json();
    const validation = organizationCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    await updateOrganization(orgId, { name: validation.data.name });

    const organization = await getOrganization(orgId);
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Failed to update organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
