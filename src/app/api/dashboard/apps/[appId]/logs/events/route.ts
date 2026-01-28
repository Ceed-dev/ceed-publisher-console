import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getApp } from '@/lib/db/apps';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { getEventsByApp } from '@/lib/db/events';
import { EventType } from '@/types/event';

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
      eventType?: EventType;
      requestId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      cursor?: string;
    } = {};

    const eventType = searchParams.get('eventType');
    if (eventType && ['impression', 'click'].includes(eventType)) {
      filters.eventType = eventType as EventType;
    }

    const requestId = searchParams.get('requestId');
    if (requestId) filters.requestId = requestId;

    const startDate = searchParams.get('startDate');
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get('endDate');
    if (endDate) filters.endDate = new Date(endDate);

    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);

    const cursor = searchParams.get('cursor');
    if (cursor) filters.cursor = cursor;

    const { events, nextCursor } = await getEventsByApp(appId, filters);

    return NextResponse.json({ events, nextCursor });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
