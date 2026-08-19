import { type NextRequest, NextResponse } from 'next/server';
import { API_NO_STORE_HEADERS } from '@/lib/api/route-config';
import {
  INSIGHTS_SITE_URL,
  insightsSubdomainPathFromMainPath,
  isInsightsHostname,
  shouldRedirectMainSiteInsightsToSubdomain,
  shouldRewriteInsightsPath,
} from '@/lib/insights/site';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  if (shouldRedirectMainSiteInsightsToSubdomain(host, pathname)) {
    const dest = new URL(INSIGHTS_SITE_URL);
    dest.pathname = insightsSubdomainPathFromMainPath(pathname);
    dest.search = request.nextUrl.search;
    return NextResponse.redirect(dest, 301);
  }

  if (isInsightsHostname(host) && shouldRewriteInsightsPath(pathname)) {
    if (pathname === '/insights' || pathname.startsWith('/insights/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/insights' ? '/' : pathname.slice('/insights'.length);
      if (!url.pathname.startsWith('/')) {
        url.pathname = `/${url.pathname}`;
      }
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/insights' : `/insights${pathname}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-gsa-surface', 'insights');
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (pathname.startsWith('/api/dashboard') && !user) {
    return NextResponse.json(
      { success: false, error: 'No autenticado' },
      { status: 401, headers: API_NO_STORE_HEADERS },
    );
  }

  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === '/dashboard/humi' || pathname.startsWith('/dashboard/humi/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/auth/login') && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') ?? '/dashboard';
    const url = request.nextUrl.clone();
    url.pathname = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Keep public media/fonts off the Insights host rewrite (mp4 was 404 as /insights/[slug]).
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|mp4|otf|pdf|png|svg|ttf|txt|webm|webp|woff|woff2|xml)$).*)',
  ],
};
