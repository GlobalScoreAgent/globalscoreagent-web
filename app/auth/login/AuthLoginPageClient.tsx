'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { authCopy } from '@/content/auth/copy';
import { pick } from '@/content/marketing/i18n';
import { clientLoginProcess } from '@/lib/gsa/login-process-client';
import { getOAuthCallbackUrl, setOAuthRedirectCookie } from '@/lib/auth/redirect';

type Tab = 'login' | 'register';

const inputClass =
  'w-full rounded-2xl border border-gold/30 bg-zinc-800 px-5 py-4 text-white placeholder-zinc-500 transition-all focus:border-gold focus:outline-none';

const primaryBtnClass =
  'w-full rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 py-4 text-lg font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';

const oauthBtnClass =
  'flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-gold/40 hover:text-white disabled:opacity-60';

function mapAuthError(message: string, lang: 'es' | 'en'): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return pick(lang, authCopy.errors.invalidCredentials);
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return pick(lang, authCopy.errors.emailInUse);
  }
  if (lower.includes('password') && lower.includes('6')) {
    return pick(lang, authCopy.errors.weakPassword);
  }
  if (lower.includes('login_process')) {
    return pick(lang, authCopy.errors.loginProcessFailed);
  }
  return pick(lang, authCopy.errors.generic);
}

async function getSupabaseClient() {
  const { createClient } = await import('@/utils/supabase/client');
  return createClient();
}

type AuthLoginPageClientProps = {
  redirectTo: string;
  oauthError: boolean;
  initialTab: Tab;
};

export default function AuthLoginPageClient({
  redirectTo,
  oauthError,
  initialTab,
}: AuthLoginPageClientProps) {
  const router = useRouter();
  const { language } = useLanguage();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (oauthError) {
      setErrorMessage(pick(language, authCopy.errors.oauthFailed));
      setStatus('error');
    }
  }, [oauthError, language]);

  const goToDashboard = async (
    loginBody?: Parameters<typeof clientLoginProcess>[0],
  ) => {
    try {
      await clientLoginProcess(loginBody);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        mapAuthError(err instanceof Error ? err.message : '', language),
      );
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus('error');
      setErrorMessage(mapAuthError(error.message, language));
      return;
    }

    await goToDashboard();
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus('error');
      setErrorMessage(pick(language, authCopy.errors.nameRequired));
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage(pick(language, authCopy.errors.passwordMismatch));
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setErrorMessage(pick(language, authCopy.errors.weakPassword));
      return;
    }

    setStatus('loading');

    const supabase = await getSupabaseClient();
    setOAuthRedirectCookie(redirectTo);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: trimmedName,
          full_name: trimmedName,
        },
        emailRedirectTo: getOAuthCallbackUrl(),
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(mapAuthError(error.message, language));
      return;
    }

    if (data.session) {
      await goToDashboard({
        is_registration: true,
        display_name: trimmedName,
        avatar_url: null,
      });
      return;
    }

    setStatus('success');
    setAwaitingEmailConfirm(true);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setErrorMessage('');

    const supabase = await getSupabaseClient();
    setOAuthRedirectCookie(redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthCallbackUrl(),
      },
    });

    if (error) {
      setOauthLoading(null);
      setStatus('error');
      setErrorMessage(pick(language, authCopy.errors.oauthFailed));
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          {pick(language, authCopy.brand.title)}
        </h1>
        <p className="text-sm text-zinc-400">{pick(language, authCopy.brand.subtitle)}</p>
      </div>

      <div className="rounded-3xl border border-gold/30 bg-zinc-900/70 p-8 backdrop-blur-xl md:p-10">
        <div className="mb-8 flex rounded-2xl border border-zinc-800 bg-zinc-950/60 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setStatus('idle');
              setErrorMessage('');
              setAwaitingEmailConfirm(false);
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === 'login'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pick(language, authCopy.tabs.login)}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setStatus('idle');
              setErrorMessage('');
              setAwaitingEmailConfirm(false);
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === 'register'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pick(language, authCopy.tabs.register)}
          </button>
        </div>

        {awaitingEmailConfirm ? (
          <div className="py-6 text-center">
            <h2 className="mb-3 text-xl font-semibold text-amber-300">
              {pick(language, authCopy.register.confirmEmailTitle)}
            </h2>
            <p className="mb-6 text-zinc-400">
              {pick(language, authCopy.register.confirmEmailBody)}
            </p>
            <button
              type="button"
              onClick={() => {
                setAwaitingEmailConfirm(false);
                setTab('login');
                setStatus('idle');
              }}
              className={primaryBtnClass}
            >
              {pick(language, authCopy.tabs.login)}
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                {pick(language, tab === 'login' ? authCopy.login.title : authCopy.register.title)}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {pick(
                  language,
                  tab === 'login' ? authCopy.login.subtitle : authCopy.register.subtitle,
                )}
              </p>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.login.emailLabel)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder={pick(language, authCopy.login.emailPlaceholder)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.login.passwordLabel)}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder={pick(language, authCopy.login.passwordPlaceholder)}
                  />
                </div>
                {status === 'error' && errorMessage && (
                  <p className="text-sm text-red-400" role="alert">
                    {errorMessage}
                  </p>
                )}
                <button type="submit" disabled={status === 'loading'} className={primaryBtnClass}>
                  {status === 'loading'
                    ? pick(language, authCopy.login.submitting)
                    : pick(language, authCopy.login.submit)}
                </button>
                <p className="text-center text-sm text-zinc-500">
                  {pick(language, authCopy.login.noAccount)}{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="font-medium text-gold hover:underline"
                  >
                    {pick(language, authCopy.login.switchToRegister)}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.register.nameLabel)}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className={inputClass}
                    placeholder={pick(language, authCopy.register.namePlaceholder)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.register.emailLabel)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder={pick(language, authCopy.register.emailPlaceholder)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.register.passwordLabel)}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder={pick(language, authCopy.register.passwordPlaceholder)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    {pick(language, authCopy.register.confirmPasswordLabel)}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder={pick(language, authCopy.register.confirmPasswordPlaceholder)}
                  />
                </div>
                {status === 'error' && errorMessage && (
                  <p className="text-sm text-red-400" role="alert">
                    {errorMessage}
                  </p>
                )}
                <button type="submit" disabled={status === 'loading'} className={primaryBtnClass}>
                  {status === 'loading'
                    ? pick(language, authCopy.register.submitting)
                    : pick(language, authCopy.register.submit)}
                </button>
                <p className="text-center text-sm text-zinc-500">
                  {pick(language, authCopy.register.hasAccount)}{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="font-medium text-gold hover:underline"
                  >
                    {pick(language, authCopy.register.switchToLogin)}
                  </button>
                </p>
              </form>
            )}

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs uppercase tracking-wider text-zinc-500">
                {pick(language, authCopy.oauth.divider)}
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={oauthLoading !== null}
                onClick={() => handleOAuth('google')}
                className={oauthBtnClass}
              >
                {oauthLoading === 'google'
                  ? '…'
                  : pick(language, authCopy.oauth.google)}
              </button>
              <button
                type="button"
                disabled={oauthLoading !== null}
                onClick={() => handleOAuth('github')}
                className={oauthBtnClass}
              >
                {oauthLoading === 'github'
                  ? '…'
                  : pick(language, authCopy.oauth.github)}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-gold">
          {pick(language, authCopy.backHome)}
        </Link>
      </p>
    </div>
  );
}
