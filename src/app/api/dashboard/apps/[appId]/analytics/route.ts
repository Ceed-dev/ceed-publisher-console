import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getApp } from '@/lib/db/apps';
import { getMemberByUserAndOrg } from '@/lib/db/members';
import { countRequests } from '@/lib/db/requests';
import { countEvents } from '@/lib/db/events';

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

  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  if (!startDateParam || !endDateParam) {
    return NextResponse.json(
      { error: 'startDate and endDate are required' },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  try {
    const app = await getApp(appId);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const member = await getMemberByUserAndOrg(user.uid, app.orgId);
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalRequests,
      successfulRequests,
      totalImpressions,
      totalClicks,
    ] = await Promise.all([
      countRequests(appId, startDate, endDate),
      countRequests(appId, startDate, endDate, 'success'),
      countEvents(appId, startDate, endDate, 'impression'),
      countEvents(appId, startDate, endDate, 'click'),
    ]);

    const fillRate = totalRequests > 0
      ? (successfulRequests / totalRequests) * 100
      : 0;

    const clickThroughRate = totalImpressions > 0
      ? (totalClicks / totalImpressions) * 100
      : 0;

    return NextResponse.json({
      metrics: {
        totalRequests,
        successfulRequests,
        fillRate,
        totalImpressions,
        totalClicks,
        clickThroughRate,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
