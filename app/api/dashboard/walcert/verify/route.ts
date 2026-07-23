import { apiJsonResponse } from '@/lib/api/route-config';
import { requireActiveDashboardUser } from '@/lib/auth/require-active-subscription';
import {
  isWalcertTxHash,
  isWalcertVerifyResult,
  type WalcertVerifyResult,
} from '@/content/dashboard/walcert-verify';

export const dynamic = 'force-dynamic';

const DEFAULT_BASE = 'https://walcert.globalscoreagent.com';
const VERIFY_TIMEOUT_MS = 60_000;

function walcertBaseUrl(): string {
  const raw = process.env.WALCERT_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return DEFAULT_BASE;
}

function optionalHexString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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

  const {
    tx_hash: txHashRaw,
    data_hash: dataHashRaw,
    certificate_id: certificateIdRaw,
  } = body as {
    tx_hash?: unknown;
    data_hash?: unknown;
    certificate_id?: unknown;
  };

  if (typeof txHashRaw !== 'string' || !isWalcertTxHash(txHashRaw)) {
    return apiJsonResponse(
      { success: false, error: 'invalid_tx_hash' },
      { status: 400 },
    );
  }

  const tx_hash = txHashRaw.trim();
  const upstreamBody: Record<string, string> = { tx_hash };

  const dataHash = optionalHexString(dataHashRaw);
  if (dataHash) upstreamBody.data_hash = dataHash;

  const certificateId = optionalHexString(certificateIdRaw);
  if (certificateId) upstreamBody.certificate_id = certificateId;

  const url = `${walcertBaseUrl()}/v1/verify`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(upstreamBody),
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

      let errorCode = 'upstream_error';
      if (
        upstream.status === 400 ||
        reason === 'invalid_tx_hash' ||
        detail === 'invalid_tx_hash'
      ) {
        errorCode = 'invalid_tx_hash';
      } else if (
        upstream.status === 404 ||
        reason === 'not_found' ||
        detail === 'not_found'
      ) {
        errorCode = 'not_found';
      } else if (
        upstream.status === 502 ||
        reason === 'verification_error' ||
        detail === 'verification_error'
      ) {
        errorCode = 'verification_error';
      }

      // Prefer structured verify payload when agent returns valid:false with body
      if (isWalcertVerifyResult(data)) {
        return apiJsonResponse(
          {
            success: true,
            result: data as WalcertVerifyResult,
          },
          {
            status: 200,
          },
        );
      }

      return apiJsonResponse(
        {
          success: false,
          error: errorCode,
          status: upstream.status,
          upstream: data,
        },
        {
          status:
            upstream.status >= 400 && upstream.status < 600
              ? upstream.status
              : 502,
        },
      );
    }

    if (!isWalcertVerifyResult(data)) {
      return apiJsonResponse(
        { success: false, error: 'invalid_upstream_payload' },
        { status: 502 },
      );
    }

    return apiJsonResponse({
      success: true,
      result: data as WalcertVerifyResult,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    console.warn('[dashboard/walcert/verify]', aborted ? 'timeout' : err);
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
