export const INSIGHTS_SITE_HOST = 'insights.globalscoreagent.com';
export const INSIGHTS_SITE_URL = `https://${INSIGHTS_SITE_HOST}`;

const PRODUCTION_MAIN_HOSTS = new Set(['www.globalscoreagent.com', 'globalscoreagent.com']);

export function isInsightsHostname(host: string | null | undefined): boolean {
  const hostname = (host ?? '').split(':')[0].toLowerCase();
  return hostname === INSIGHTS_SITE_HOST || hostname.startsWith('insights.');
}

/** Apex/www only — never localhost or Vercel previews. */
export function shouldRedirectMainSiteInsightsToSubdomain(
  host: string | null | undefined,
  pathname: string,
): boolean {
  if (!(pathname === '/insights' || pathname.startsWith('/insights/'))) return false;
  if (isInsightsHostname(host)) return false;
  const hostname = (host ?? '').split(':')[0].toLowerCase();
  return PRODUCTION_MAIN_HOSTS.has(hostname);
}

/** Map `/insights` → `/` and `/insights/slug` → `/slug` on the Insights host. */
export function insightsSubdomainPathFromMainPath(pathname: string): string {
  if (pathname === '/insights' || pathname === '/insights/') return '/';
  const rest = pathname.slice('/insights'.length);
  return rest.startsWith('/') ? rest : `/${rest}`;
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

/** Canonical URLs always prefer the Insights subdomain. */
export function insightsCanonicalUrl(_host?: string | null, slug?: string): string {
  return slug ? `${INSIGHTS_SITE_URL}/${slug}` : INSIGHTS_SITE_URL;
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
