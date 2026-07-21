import { apiJsonResponse } from '@/lib/api/route-config';
import { requireActiveDashboardUser } from '@/lib/auth/require-active-subscription';
import {
  isWalcertPreviewType,
  type WalcertPreviewResult,
} from '@/content/dashboard/walcert-examples';

export const dynamic = 'force-dynamic';

const DEFAULT_BASE = 'https://walcert.globalscoreagent.com';
const PREVIEW_TIMEOUT_MS = 90_000;

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

function walcertBaseUrl(): string {
  const raw = process.env.WALCERT_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return DEFAULT_BASE;
}

/** Client IP from Vercel / proxy headers so upstream rate-limits per user, not egress. */
function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return null;
}

export async function POST(request: Request) {
  const auth = await requireActiveDashboardUser();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiJsonResponse(
      { success: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object') {
    return apiJsonResponse(
      { success: false, error: 'invalid_body' },
      { status: 400 },
    );
  }

  const { wallet_address: walletAddress, type } = body as {
    wallet_address?: unknown;
    type?: unknown;
  };

  if (typeof walletAddress !== 'string' || !WALLET_RE.test(walletAddress.trim())) {
    return apiJsonResponse(
      { success: false, error: 'invalid_wallet' },
      { status: 400 },
    );
  }

  if (typeof type !== 'string' || !isWalcertPreviewType(type)) {
    return apiJsonResponse(
      { success: false, error: 'preview_not_allowed' },
      { status: 403 },
    );
  }

  const url = `${walcertBaseUrl()}/v1/preview/${type}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PREVIEW_TIMEOUT_MS);
  const clientIp = clientIpFromRequest(request);

  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (clientIp) {
    upstreamHeaders['X-Forwarded-For'] = clientIp;
    upstreamHeaders['X-Real-IP'] = clientIp;
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify({ wallet_address: walletAddress.trim() }),
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!upstream.ok) {
      const reason =
        data &&
        typeof data === 'object' &&
        'reason' in data &&
        typeof (data as { reason: unknown }).reason === 'string'
          ? (data as { reason: string }).reason
          : null;

      const detail =
        data &&
        typeof data === 'object' &&
        'detail' in data &&
        typeof (data as { detail: unknown }).detail === 'string'
          ? (data as { detail: string }).detail
          : null;

      const retryAfterHeader = upstream.headers.get('retry-after');
      const retryAfter =
        retryAfterHeader && /^\d+$/.test(retryAfterHeader)
          ? Number(retryAfterHeader)
          : null;

      let errorCode = 'upstream_error';
      if (
        upstream.status === 403 ||
        reason === 'preview_not_allowed' ||
        detail === 'preview_not_allowed'
      ) {
        errorCode = 'preview_not_allowed';
      } else if (upstream.status === 429) {
        errorCode = 'rate_limited';
      } else if (reason === 'provider_quota_exceeded') {
        errorCode = 'provider_quota_exceeded';
      } else if (
        reason === 'provider_not_configured' ||
        reason === 'provider_error'
      ) {
        errorCode = 'certificate_unavailable';
      }

      return apiJsonResponse(
        {
          success: false,
          error: errorCode,
          status: upstream.status,
          retry_after: retryAfter,
          upstream: data,
        },
        {
          status:
            upstream.status >= 400 && upstream.status < 600
              ? upstream.status
              : 502,
          headers:
            retryAfter != null
              ? { 'Retry-After': String(retryAfter) }
              : undefined,
        },
      );
    }

    if (
      !data ||
      typeof data !== 'object' ||
      typeof (data as WalcertPreviewResult).grade !== 'string'
    ) {
      return apiJsonResponse(
        { success: false, error: 'invalid_upstream_payload' },
        { status: 502 },
      );
    }

    return apiJsonResponse({
      success: true,
      preview: data as WalcertPreviewResult,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    console.warn('[dashboard/walcert/preview]', aborted ? 'timeout' : err);
    return apiJsonResponse(
      {
        success: false,
        error: aborted ? 'timeout' : 'proxy_failed',
      },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}
