/**
 * @fileoverview SDK Event Tracking Endpoint
 *
 * Public API endpoint for SDK event tracking.
 * Publishers call this endpoint to report ad impressions and clicks.
 *
 * @route POST /api/events
 * @public
 *
 * @example Request Body
 * ```json
 * {
 *   "appId": "app_123",
 *   "requestId": "req_456",
 *   "eventType": "impression",
 *   "adId": "ad_789"
 * }
 * ```
 *
 * @example Response
 * ```json
 * {
 *   "eventId": "evt_101"
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApp } from '@/lib/db/apps';
import { getRequest } from '@/lib/db/requests';
import { createEvent } from '@/lib/db/events';
import { getCorsHeaders, isOriginAllowed } from '@/lib/utils/cors';
import { z } from 'zod';

/**
 * Zod schema for event tracking validation
 */
const eventSchema = z.object({
  /** Publisher app identifier */
  appId: z.string(),
  /** Associated ad request ID */
  requestId: z.string(),
  /** Type of event being tracked */
  eventType: z.enum(['impression', 'click']),
  /** Optional ad identifier */
  adId: z.string().optional(),
});

/**
 * Handle CORS preflight requests
 * @param request - Incoming request
 * @returns Empty response with CORS headers
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('Origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin, ['*']),
  });
}

/**
 * Track ad event from SDK
 *
 * @description
 * Records impression and click events for analytics.
 * Validates that the request exists and belongs to the specified app.
 *
 * @param request - Incoming POST request with event payload
 * @returns Event ID or error
 *
 * @throws 400 - Invalid request body or request doesn't belong to app
 * @throws 403 - Origin not allowed
 * @throws 404 - App or request not found
 * @throws 500 - Internal server error
 */
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
