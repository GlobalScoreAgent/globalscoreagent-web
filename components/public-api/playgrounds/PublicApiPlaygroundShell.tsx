'use client';

import { type FormEvent, type ReactNode } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { publicApiCopy } from '@/content/public-api/copy';
import { pick } from '@/content/marketing/i18n';
import type { PublicApiFetchResult } from '@/lib/public-api/constants';
import { cn } from '@/lib/utils';

type PublicApiPlaygroundShellProps = {
  title: string;
  children: ReactNode;
  requestUrl: string;
  onSubmit: () => void;
  loading: boolean;
  result: PublicApiFetchResult | null;
  errorMessage: string | null;
};

function statusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
  if (status === 429) return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
  return 'border-red-500/40 bg-red-500/10 text-red-400';
}

export default function PublicApiPlaygroundShell({
  title,
  children,
  requestUrl,
  onSubmit,
  loading,
  result,
  errorMessage,
}: PublicApiPlaygroundShellProps) {
  const { language } = useLanguage();
  const copy = publicApiCopy.playground;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="rounded-2xl border border-gold/20 bg-zinc-950/80 p-5 ring-1 ring-inset ring-white/5">
      <h3 className="mb-1 text-lg font-semibold text-gold">{title}</h3>
      <p className="mb-4 text-xs text-zinc-500">{pick(language, copy.rateLimitNote)}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {children}

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {pick(language, copy.requestUrl)}
          </p>
          <code className="block overflow-x-auto rounded-lg border border-zinc-800 bg-black/50 px-3 py-2 text-xs text-zinc-300">
            GET {requestUrl}
          </code>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2 text-sm font-semibold text-black transition-opacity disabled:opacity-60"
        >
          {loading
            ? pick(language, copy.loading)
            : pick(language, copy.sendRequest)}
        </button>
      </form>

      {errorMessage ? <p className="mt-4 text-sm text-red-400">{errorMessage}</p> : null}

      {result ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {pick(language, copy.response)}
            </p>
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-xs font-semibold',
                statusBadgeClass(result.status),
              )}
            >
              HTTP {result.status}
            </span>
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-zinc-800 bg-black/50 p-4 text-xs leading-relaxed text-zinc-300">
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export function PlaygroundField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export const playgroundInputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30';

export const playgroundSelectClass = playgroundInputClass;
