'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

export default function WalcertIdentitySection() {
  const { language } = useLanguage();
  const { identity } = walcertCopy;

  return (
    <SectionSurface id="identity" tone="darker">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, identity.title)}
        </h2>
        <p className="mb-10 text-center text-base text-zinc-400">
          {pick(language, identity.intro)}
        </p>
        <div className="space-y-6">
          {identity.groups.map((group) => (
            <GlassCard key={pick(language, group.title)} variant="elevated" className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
                {pick(language, group.title)}
              </h3>
              {group.rows.map((row, i) => {
                const href =
                  'href' in row && row.href
                    ? 'authRedirect' in row && row.authRedirect
                      ? buildAuthLoginUrl(row.href)
                      : row.href
                    : null;

                return (
                  <div
                    key={i}
                    className="flex flex-col gap-1 border-b border-zinc-800/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {pick(language, row.label)}
                    </span>
                    {href ? (
                      href.startsWith('http') ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-gold hover:text-amber-300 sm:text-right"
                        >
                          {pick(language, row.value)}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="break-all text-sm text-gold hover:text-amber-300 sm:text-right"
                        >
                          {pick(language, row.value)}
                        </Link>
                      )
                    ) : (
                      <span className="break-all text-sm text-zinc-200 sm:text-right">
                        {pick(language, row.value)}
                      </span>
                    )}
                  </div>
                );
              })}
            </GlassCard>
          ))}
        </div>
        <p className="mt-6 text-center text-sm leading-relaxed text-zinc-400">
          {pick(language, identity.footnote)}
        </p>
        <p className="mt-3 text-center text-sm text-zinc-500">
          {pick(language, identity.hackathon)}
        </p>
      </div>
    </SectionSurface>
  );
}
