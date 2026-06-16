import { NextResponse } from 'next/server';

export const API_NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
} as const;

type JsonInit = ResponseInit & { status?: number };

export function apiJsonResponse<T>(body: T, init?: JsonInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...API_NO_STORE_HEADERS,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}
