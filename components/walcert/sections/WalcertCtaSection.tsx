'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';

export default function WalcertCtaSection() {
  const { language } = useLanguage();
  const { cta } = walcertCopy;
  const dashboardHref = buildAuthLoginUrl('/dashboard/walcert');

  return (
    <section className="border-t border-zinc-800 bg-zinc-950 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-semibold text-white">
          {pick(language, cta.title)}
        </h2>
        <p className="mb-8 text-zinc-400">{pick(language, cta.description)}</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href={dashboardHref}
            className="inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-8 py-3.5 text-base font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95"
          >
            {pick(language, cta.openAgent)}
          </Link>
          <Link
            href="/walcert/developers"
            className="inline-flex rounded-2xl border border-gold/40 px-8 py-3.5 text-base font-medium text-gold transition-colors hover:bg-gold/10"
          >
            {pick(language, cta.developers)}
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← {pick(language, cta.backToPortal)}
          </Link>
        </div>
      </div>
    </section>
  );
}
