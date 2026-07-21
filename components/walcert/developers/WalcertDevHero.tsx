'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { WALCERT_LIVE_URL } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';

export default function WalcertDevHero() {
  const { language } = useLanguage();
  const { hero } = walcertDevelopersCopy;
  const dashboardHref = buildAuthLoginUrl('/dashboard/walcert');

  return (
    <section className="border-b border-zinc-800 bg-zinc-950 px-6 pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {pick(language, hero.title)}
        </h1>
        <p className="mb-8 text-base leading-relaxed text-zinc-400 md:text-lg">
          {pick(language, hero.subtitle)}
        </p>
        <div className="mb-8 rounded-2xl border border-gold/25 bg-gold/5 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {pick(language, hero.baseUrlLabel)}
          </p>
          <a
            href={WALCERT_LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 break-all font-mono text-sm font-medium text-gold hover:text-amber-300 md:text-base"
          >
            {hero.baseUrl}
          </a>
          <p className="mt-2 text-xs text-zinc-500">
            {pick(language, hero.baseUrlHint)}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <a
            href={WALCERT_LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-gold hover:text-amber-300"
          >
            {pick(language, hero.openAgentCard)} →
          </a>
          <Link
            href={dashboardHref}
            className="inline-flex text-sm font-medium text-gold hover:text-amber-300"
          >
            {pick(language, hero.openAgent)} →
          </Link>
          <Link
            href="/walcert"
            className="inline-flex text-sm text-zinc-400 hover:text-zinc-200"
          >
            ← {pick(language, hero.backToProduct)}
          </Link>
        </div>
      </div>
    </section>
  );
}
