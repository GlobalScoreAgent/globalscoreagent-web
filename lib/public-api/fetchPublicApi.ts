import type { PublicApiEndpoint, PublicApiFetchResult } from './constants';

export async function fetchPublicApi(
  endpoint: PublicApiEndpoint,
  params: Record<string, string>,
): Promise<PublicApiFetchResult> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const proxyUrl = `/api/web-page/public-api-proxy?${searchParams.toString()}`;

  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = { success: false, error: 'Invalid JSON response' };
  }

  const displayParams = new URLSearchParams(params);
  const requestUrl = `https://api.globalscoreagent.com/v1/agents/${endpoint}${
    displayParams.toString() ? `?${displayParams.toString()}` : ''
  }`;

  return { status: response.status, body, requestUrl };
}
