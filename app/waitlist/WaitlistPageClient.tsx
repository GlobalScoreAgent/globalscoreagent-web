'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { waitlistCopy } from '@/content/waitlist/copy';
import { pick } from '@/content/marketing/i18n';
import { fetchApiNoStore } from '@/lib/api/client-fetch';
import { useState } from 'react';

type SuccessKind = 'registered' | 'alreadyRegistered';

function mapWaitlistApiError(
  code: string | undefined,
  language: 'es' | 'en'
): string {
  switch (code) {
    case 'invalid_email':
      return pick(language, waitlistCopy.errors.invalidEmail);
    case 'server_error':
      return pick(language, waitlistCopy.errors.submitFailed);
    default:
      return pick(language, waitlistCopy.errors.generic);
  }
}

export default function WaitlistPageClient() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [successKind, setSuccessKind] = useState<SuccessKind | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetchApiNoStore('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setSuccessKind(data.alreadyRegistered ? 'alreadyRegistered' : 'registered');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(mapWaitlistApiError(data.error, language));
      }
    } catch {
      setStatus('error');
      setErrorMessage(pick(language, waitlistCopy.errors.connection));
    }
  };

  const successBodyCopy =
    successKind === 'alreadyRegistered'
      ? waitlistCopy.success.alreadyRegistered
      : waitlistCopy.success.message;

  return (
    <div className="min-h-[60vh] bg-zinc-950 py-12 text-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tighter">
            {pick(language, waitlistCopy.title)}
          </h1>
          <p className="mx-auto max-w-md text-xl text-zinc-400">
            {pick(language, waitlistCopy.subtitle)}
          </p>
        </div>

        <div className="rounded-3xl border border-gold/30 bg-zinc-900/70 p-10 backdrop-blur-xl">
          {status === 'success' && successKind ? (
            <div className="py-12 text-center">
              <div className="mb-6 text-6xl" aria-hidden>
                ✅
              </div>
              <h2 className="mb-3 text-3xl font-semibold text-amber-300">
                {pick(language, waitlistCopy.success.title)}
              </h2>
              <p className="mb-8 text-lg text-zinc-300">{pick(language, successBodyCopy)}</p>
              <a
                href="/"
                className="inline-block rounded-2xl bg-gold px-10 py-4 text-lg font-semibold text-black transition-all hover:bg-amber-400 active:scale-95"
              >
                {pick(language, waitlistCopy.success.backHome)}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  {pick(language, waitlistCopy.form.emailLabel)}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gold/30 bg-zinc-800 px-6 py-5 text-white placeholder-zinc-500 transition-all focus:border-gold focus:outline-none"
                  placeholder={pick(language, waitlistCopy.form.emailPlaceholder)}
                />
              </div>
              {status === 'error' && errorMessage && (
                <p className="text-sm text-red-400" role="alert">
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-2xl bg-gold py-5 text-xl font-semibold text-black transition-all hover:bg-amber-400 active:scale-95 disabled:bg-zinc-600"
              >
                {status === 'loading'
                  ? pick(language, waitlistCopy.form.submitting)
                  : pick(language, waitlistCopy.form.submit)}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          {pick(language, waitlistCopy.footerNote)}
        </p>
      </div>
    </div>
  );
}
