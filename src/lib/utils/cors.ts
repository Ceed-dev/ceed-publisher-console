import { NextRequest, NextResponse } from 'next/server';

export function getCorsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (!origin) {
    return headers;
  }

  if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

export function handleCorsPreFlight(
  request: NextRequest,
  allowedOrigins: string[]
): NextResponse {
  const origin = request.headers.get('Origin');
  const headers = getCorsHeaders(origin, allowedOrigins);

  return new NextResponse(null, {
    status: 204,
    headers,
  });
}

export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
}
