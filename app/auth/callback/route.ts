import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import { runLoginProcessForUser } from '@/lib/gsa/login-process';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = sanitizeRedirectPath(searchParams.get('redirect'));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // setAll from Server Component context
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await runLoginProcessForUser(supabase, user, { is_registration: true });
        } catch (loginProcessError) {
          console.error('[auth/callback] user_login_process failed:', loginProcessError);
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  const loginUrl = new URL('/auth/login', origin);
  loginUrl.searchParams.set('redirect', redirect);
  loginUrl.searchParams.set('error', 'oauth');
  return NextResponse.redirect(loginUrl.toString());
}
