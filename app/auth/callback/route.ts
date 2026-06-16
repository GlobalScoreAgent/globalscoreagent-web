import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { GSA_OAUTH_REDIRECT_COOKIE, readOAuthRedirectCookie } from '@/lib/auth/redirect';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const cookieStore = await cookies();
  const redirect = readOAuthRedirectCookie(
    cookieStore.get(GSA_OAUTH_REDIRECT_COOKIE)?.value,
    searchParams.get('redirect'),
  );

  const destination = new URL(redirect, origin);
  destination.searchParams.set('gsa_login', 'registration');

  let response = NextResponse.redirect(destination);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      response.cookies.delete(GSA_OAUTH_REDIRECT_COOKIE);
      return response;
    }
  }

  const loginUrl = new URL('/auth/login', origin);
  loginUrl.searchParams.set('redirect', redirect);
  loginUrl.searchParams.set('error', 'oauth');
  return NextResponse.redirect(loginUrl.toString());
}
