import AuthLoginPageClient from './AuthLoginPageClient';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';

type AuthLoginPageProps = {
  searchParams: {
    redirect?: string | string[];
    tab?: string | string[];
    error?: string | string[];
  };
};

function readParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default function AuthLoginPage({ searchParams }: AuthLoginPageProps) {
  const redirectTo = sanitizeRedirectPath(readParam(searchParams.redirect));
  const oauthError = readParam(searchParams.error) === 'oauth';
  const initialTab = readParam(searchParams.tab) === 'register' ? 'register' : 'login';

  return (
    <AuthLoginPageClient
      redirectTo={redirectTo}
      oauthError={oauthError}
      initialTab={initialTab}
    />
  );
}
