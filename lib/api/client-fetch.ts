import type { StatisticsPage } from '@/lib/web-page/statistics';

export function fetchApiNoStore(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: 'no-store' });
}

/** Live marketing KPIs: cache-busted GET for /api/web-page/statistics. */
export function fetchWebPageStatistics(page: StatisticsPage): Promise<Response> {
  const url = `/api/web-page/statistics?page=${encodeURIComponent(page)}&_=${Date.now()}`;
  return fetchApiNoStore(url);
}
