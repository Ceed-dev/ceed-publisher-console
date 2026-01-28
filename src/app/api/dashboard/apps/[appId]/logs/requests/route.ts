import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getApp } from '@/lib/db/apps';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { getRequestsByApp } from '@/lib/db/requests';
import { RequestStatus } from '@/types/request';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const member = await getMemberByUserAndOrg(user.uid, app.orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filters: {
      status?: RequestStatus;
      platform?: 'web' | 'ios';
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      cursor?: string;
    } = {};

    const status = searchParams.get('status');
    if (status && ['success', 'error', 'no_fill'].includes(status)) {
      filters.status = status as RequestStatus;
    }

    const platform = searchParams.get('platform');
    if (platform && ['web', 'ios'].includes(platform)) {
      filters.platform = platform as 'web' | 'ios';
    }

    const startDate = searchParams.get('startDate');
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get('endDate');
    if (endDate) filters.endDate = new Date(endDate);

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);

    const cursor = searchParams.get('cursor');
    if (cursor) filters.cursor = cursor;

    const { requests, nextCursor } = await getRequestsByApp(appId, filters);

    return NextResponse.json({ requests, nextCursor });
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
