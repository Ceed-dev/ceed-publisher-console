/**
 * @fileoverview SDK Ad Request Endpoint
 *
 * Public API endpoint for SDK ad requests.
 * Publishers call this endpoint to request ads for their apps.
 *
 * @route POST /api/requests
 * @public
 *
 * @example Request Body
 * ```json
 * {
 *   "appId": "app_123",
 *   "platform": "web",
 *   "language": "eng",
 *   "contextText": "optional context for ad matching"
 * }
 * ```
 *
 * @example Response
 * ```json
 * {
 *   "requestId": "req_456",
 *   "ad": {
 *     "adId": "ad_789",
 *     "type": "banner",
 *     "content": { ... }
 *   }
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApp } from '@/lib/db/apps';
import { createRequest } from '@/lib/db/requests';
import { getCorsHeaders, isOriginAllowed } from '@/lib/utils/cors';
import { processContextText } from '@/lib/utils/context-text';
import { z } from 'zod';

/**
 * Zod schema for ad request validation
 */
const requestSchema = z.object({
  /** Publisher app identifier */
  appId: z.string(),
  /** Platform making the request */
  platform: z.enum(['web', 'ios']),
  /** Requested language for ad content */
  language: z.enum(['eng', 'jpn']),
  /** Optional context for ad matching */
  contextText: z.string().optional(),
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
 * Process ad request from SDK
 *
 * @description
 * Validates the request, checks app configuration, processes context,
 * and returns an ad response. Logs the request for analytics.
 *
 * @param request - Incoming POST request with ad request payload
 * @returns Ad response or error
 *
 * @throws 400 - Invalid request body or unsupported platform/language
 * @throws 403 - App suspended or origin not allowed
 * @throws 404 - App not found
 * @throws 500 - Internal server error
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('Origin');
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      const headers = getCorsHeaders(origin, ['*']);
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400, headers }
      );
    }

    const { appId, platform, language, contextText } = validation.data;

    const app = await getApp(appId);
    if (!app) {
      const headers = getCorsHeaders(origin, ['*']);
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404, headers }
      );
    }

    if (app.status !== 'active') {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'App is suspended' },
        { status: 403, headers }
      );
    }

    if (!isOriginAllowed(origin, app.settings.allowedOrigins)) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403, headers }
      );
    }

    if (!app.platforms.includes(platform)) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Platform not supported' },
        { status: 400, headers }
      );
    }

    if (!app.settings.supportedLanguages.includes(language)) {
      const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
      return NextResponse.json(
        { error: 'Language not supported' },
        { status: 400, headers }
      );
    }

    const contextResult = await processContextText(
      contextText,
      app.settings.contextLoggingMode
    );

    const responseTimeMs = Date.now() - startTime;

    const adRequest = await createRequest({
      appId,
      status: 'success',
      platform,
      language,
      userAgent: request.headers.get('User-Agent') || undefined,
      origin: origin || undefined,
      ...contextResult,
      responseTimeMs,
    });

    const headers = getCorsHeaders(origin, app.settings.allowedOrigins);
    return NextResponse.json(
      {
        requestId: adRequest.requestId,
        ad: {
          adId: `ad_${Date.now()}`,
          type: 'banner',
          content: {
            title: 'Sample Ad',
            description: 'This is a sample ad for testing',
            imageUrl: 'https://via.placeholder.com/300x250',
            clickUrl: 'https://example.com',
          },
        },
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Request handling error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const headers = getCorsHeaders(origin, ['*']);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500, headers }
    );
  }
}
