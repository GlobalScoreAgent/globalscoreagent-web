const DEFAULT_REDIRECT = '/dashboard';

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

export function getCallbackUrl(redirectPath?: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const params = new URLSearchParams({ redirect: safe });
  return `${siteUrl}/auth/callback?${params.toString()}`;
}
