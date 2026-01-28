import { NextRequest, NextResponse } from 'next/server';
import { getApp } from '@/lib/db/apps';
import { createRequest } from '@/lib/db/requests';
import { getCorsHeaders, isOriginAllowed } from '@/lib/utils/cors';
import { processContextText } from '@/lib/utils/context-text';
import { z } from 'zod';

const requestSchema = z.object({
  appId: z.string(),
  platform: z.enum(['web', 'ios']),
  language: z.enum(['eng', 'jpn']),
  contextText: z.string().optional(),
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
