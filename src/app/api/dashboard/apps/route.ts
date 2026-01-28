import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createApp, getAppsByOrg } from '@/lib/db/apps';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { appCreateSchema } from '@/lib/validations/app';
import { createAuditLog } from '@/lib/db/audit-logs';

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

    const apps = await getAppsByOrg(orgId);
    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
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
    const { orgId, ...appData } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const member = await getMemberByUserAndOrg(user.uid, orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (member.role === 'analyst') {
      return NextResponse.json(
        { error: 'Analysts cannot create apps' },
        { status: 403 }
      );
    }

    const validation = appCreateSchema.safeParse(appData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const app = await createApp(orgId, validation.data);

    await createAuditLog({
      orgId,
      userId: user.uid,
      userEmail: user.email,
      action: 'app.create',
      resourceType: 'app',
      resourceId: app.appId,
    });

    return NextResponse.json({ app }, { status: 201 });
  } catch (error) {
    console.error('Failed to create app:', error);
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    );
  }
}
