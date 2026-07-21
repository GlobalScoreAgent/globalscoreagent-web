'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevLinksSection() {
  const { language } = useLanguage();
  const { links, cta } = walcertDevelopersCopy;
  const dashboardHref = buildAuthLoginUrl('/dashboard/walcert');

  return (
    <>
      <SectionSurface id="docs-links" tone="darker">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {pick(language, links.title)}
          </h2>
          <p className="mb-8 text-zinc-400">{pick(language, links.intro)}</p>
          <ul className="space-y-3">
            {links.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, item.label)}
                  <ExternalLink size={14} className="shrink-0 opacity-70" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SectionSurface>

      <section className="border-t border-zinc-800 bg-zinc-950 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-semibold text-white">
            {pick(language, cta.title)}
          </h2>
          <p className="mb-8 text-zinc-400">{pick(language, cta.description)}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={dashboardHref}
              className="inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-8 py-3.5 text-base font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300"
            >
              {pick(language, cta.openAgent)}
            </Link>
            <Link
              href="/walcert"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              ← {pick(language, cta.productPage)}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
