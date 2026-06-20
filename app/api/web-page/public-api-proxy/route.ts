import { NextRequest } from 'next/server';
import { apiJsonResponse } from '@/lib/api/route-config';
import {
  MATURITY_QUERY_PARAMS,
  PUBLIC_API_BASE_URL,
  SEARCH_QUERY_PARAMS,
  type PublicApiEndpoint,
} from '@/lib/public-api/constants';

const VALID_ENDPOINTS: PublicApiEndpoint[] = ['search', 'maturity'];

function pickWhitelistedParams(
  searchParams: URLSearchParams,
  allowed: readonly string[],
): URLSearchParams {
  const filtered = new URLSearchParams();
  for (const key of allowed) {
    const value = searchParams.get(key);
    if (value !== null && value !== '') {
      filtered.set(key, value);
    }
  }
  return filtered;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get('endpoint');

  if (!endpoint || !VALID_ENDPOINTS.includes(endpoint as PublicApiEndpoint)) {
    return apiJsonResponse(
      { success: false, error: 'Invalid endpoint. Use endpoint=search or endpoint=maturity.' },
      { status: 400 },
    );
  }

  if (endpoint === 'maturity' && !searchParams.get('canonical_slug')?.trim()) {
    return apiJsonResponse(
      { success: false, error: 'canonical_slug is required' },
      { status: 400 },
    );
  }

  const allowed =
    endpoint === 'search' ? SEARCH_QUERY_PARAMS : MATURITY_QUERY_PARAMS;
  const forwardedParams = pickWhitelistedParams(searchParams, allowed);

  const target = new URL(`${PUBLIC_API_BASE_URL}/v1/agents/${endpoint}`);
  target.search = forwardedParams.toString();

  try {
    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    let body: unknown;
    try {
      body = await upstream.json();
    } catch {
      body = { success: false, error: 'Invalid JSON from upstream API' };
    }

    return apiJsonResponse(body, { status: upstream.status });
  } catch {
    return apiJsonResponse(
      { success: false, error: 'Failed to reach public API' },
      { status: 502 },
    );
  }
}
