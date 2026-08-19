import { SITE_URL } from '@/lib/seo/site';

export const INSIGHTS_SITE_HOST = 'insights.globalscoreagent.com';
export const INSIGHTS_SITE_URL = `https://${INSIGHTS_SITE_HOST}`;

export function isInsightsHostname(host: string | null | undefined): boolean {
  const hostname = (host ?? '').split(':')[0].toLowerCase();
  return hostname === INSIGHTS_SITE_HOST || hostname.startsWith('insights.');
}

export function insightsAppPath(slug?: string): string {
  return slug ? `/insights/${slug}` : '/insights';
}

export function insightsHref(slug: string | undefined, onInsightsHost: boolean): string {
  if (onInsightsHost) {
    return slug ? `/${slug}` : '/';
  }
  return insightsAppPath(slug);
}

export function withInsightsLang(href: string, lang: 'es' | 'en'): string {
  if (lang === 'en') return href;
  const join = href.includes('?') ? '&' : '?';
  return `${href}${join}lang=es`;
}

export function insightsCanonicalUrl(host: string | null | undefined, slug?: string): string {
  if (isInsightsHostname(host)) {
    return slug ? `${INSIGHTS_SITE_URL}/${slug}` : INSIGHTS_SITE_URL;
  }
  return slug ? `${SITE_URL}/insights/${slug}` : `${SITE_URL}/insights`;
}

export function isInsightsArticlePath(
  pathname: string | null | undefined,
  onInsightsHost: boolean,
): boolean {
  if (!pathname) return false;
  if (onInsightsHost) {
    return pathname !== '/';
  }
  return pathname.startsWith('/insights/') && pathname.length > '/insights/'.length;
}

/** Static public assets must not be rewritten to `/insights/...` on the Insights host. */
const INSIGHTS_STATIC_ASSET_EXT =
  /\.(?:avif|css|gif|ico|jpe?g|js|json|map|mp4|otf|pdf|png|svg|ttf|txt|webm|webp|woff2?|xml)$/i;

export function shouldRewriteInsightsPath(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return false;
  if (pathname.startsWith('/api')) return false;
  if (INSIGHTS_STATIC_ASSET_EXT.test(pathname)) return false;
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon')
  ) {
    return false;
  }
  return true;
}
