import { type NextRequest, NextResponse } from 'next/server';
import { API_NO_STORE_HEADERS } from '@/lib/api/route-config';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const { pathname } = request.nextUrl;

  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
