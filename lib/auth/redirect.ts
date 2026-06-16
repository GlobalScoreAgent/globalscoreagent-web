const DEFAULT_REDIRECT = '/dashboard';
export const GSA_OAUTH_REDIRECT_COOKIE = 'gsa_oauth_redirect';

/** Only allow same-origin relative paths (no protocol-relative or external URLs). */
export function sanitizeRedirectPath(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') {
    return DEFAULT_REDIRECT;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }

  if (trimmed.startsWith('/auth/login')) {
    return DEFAULT_REDIRECT;
  }

  return trimmed;
}

export function buildAuthLoginUrl(redirectPath?: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  const params = new URLSearchParams({ redirect: safe });
  return `/auth/login?${params.toString()}`;
}

function resolveSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
}

/** OAuth/email redirect — must match Supabase allow list exactly (no query string). */
export function getOAuthCallbackUrl(): string {
  return `${resolveSiteOrigin()}/auth/callback`;
}

/** Persist post-auth destination across OAuth round-trip (read in /auth/callback). */
export function setOAuthRedirectCookie(redirectPath?: string): void {
  if (typeof document === 'undefined') return;
  const safe = sanitizeRedirectPath(redirectPath);
  document.cookie = `${GSA_OAUTH_REDIRECT_COOKIE}=${encodeURIComponent(safe)}; path=/; max-age=600; SameSite=Lax`;
}

export function readOAuthRedirectCookie(
  cookieValue: string | undefined,
  queryRedirect: string | null,
): string {
  if (queryRedirect) {
    return sanitizeRedirectPath(queryRedirect);
  }
  if (!cookieValue) {
    return DEFAULT_REDIRECT;
  }
  try {
    return sanitizeRedirectPath(decodeURIComponent(cookieValue));
  } catch {
    return DEFAULT_REDIRECT;
  }
}

/** @deprecated Use getOAuthCallbackUrl + setOAuthRedirectCookie for OAuth/email flows. */
export function getCallbackUrl(redirectPath?: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  const params = new URLSearchParams({ redirect: safe });
  return `${getOAuthCallbackUrl()}?${params.toString()}`;
}
