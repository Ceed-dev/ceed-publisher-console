import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getApp, updateApp } from '@/lib/db/apps';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { appUpdateSchema } from '@/lib/validations/app';
import { createAuditLog } from '@/lib/db/audit-logs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId } = await params;

  try {
    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const member = await getMemberByUserAndOrg(user.uid, app.orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Failed to fetch app:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId } = await params;

  try {
    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const member = await getMemberByUserAndOrg(user.uid, app.orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (member.role === 'analyst') {
      return NextResponse.json(
        { error: 'Analysts cannot update apps' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = appUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    await updateApp(appId, validation.data);

    await createAuditLog({
      orgId: app.orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'app.update',
      resourceType: 'app',
      resourceId: appId,
      changes: validation.data,
    });

    const updatedApp = await getApp(appId);
    return NextResponse.json({ app: updatedApp });
  } catch (error) {
    console.error('Failed to update app:', error);
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    );
  }
}
