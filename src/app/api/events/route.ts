import { NextRequest, NextResponse } from 'next/server';
import { getApp } from '@/lib/db/apps';
import { getRequest } from '@/lib/db/requests';
import { createEvent } from '@/lib/db/events';
import { getCorsHeaders, isOriginAllowed } from '@/lib/utils/cors';
import { z } from 'zod';

const eventSchema = z.object({
  appId: z.string(),
  requestId: z.string(),
  eventType: z.enum(['impression', 'click']),
  adId: z.string().optional(),
});

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('Origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin, ['*']),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('Origin');

  try {
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      const headers = getCorsHeaders(origin, ['*']);
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400, headers }
      );
    }

    const { appId, requestId, eventType, adId } = validation.data;

    const app = await getApp(appId);
    if (!app) {
      const headers = getCorsHeaders(origin, ['*']);
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404, headers }
      );
    }

    if (!isOriginAllowed(origin, app.settings.allowedOrigins)) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403, headers }
      );
    }

    const adRequest = await getRequest(requestId);
    if (!adRequest) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404, headers }
      );
    }

    if (adRequest.appId !== appId) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Request does not belong to this app' },
        { status: 400, headers }
      );
    }

    const event = await createEvent({
      appId,
      requestId,
      eventType,
      adId,
      userAgent: request.headers.get('User-Agent') || undefined,
      origin: origin || undefined,
    });

    const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
    return NextResponse.json(
      { eventId: event.eventId },
      { status: 201, headers }
    );
  } catch (error) {
    console.error('Event handling error:', error);
    const headers = getCorsHeaders(origin, ['*']);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}
