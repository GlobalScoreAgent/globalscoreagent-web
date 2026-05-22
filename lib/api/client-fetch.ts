export function fetchApiNoStore(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: 'no-store' });
}
