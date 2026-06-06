'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';

export default function MarketingFooter() {
  const { language } = useLanguage();
  const { links } = marketingCopy.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-black py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex items-center gap-3">
            <img src="/logo-gsa.png" alt="GSA" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-lg font-semibold text-white">Global Score Agent</p>
              <p className="max-w-xs text-sm text-zinc-500">
                {pick(language, marketingCopy.footer.tagline)}
              </p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="mb-3 text-sm font-medium text-zinc-400">
              {pick(language, marketingCopy.footer.contactTitle)}
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <a
                href={links.x.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-gold"
              >
                X {links.x.label}
              </a>
              <a href={links.email.href} className="text-zinc-400 transition-colors hover:text-gold">
                {links.email.label}
              </a>
              <a
                href={links.farcaster.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-gold"
              >
                {links.farcaster.label}
              </a>
              <a
                href={links.telegram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-gold"
              >
                Telegram {links.telegram.label}
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/docs/global-score-agent" className="text-zinc-500 transition-colors hover:text-zinc-400">
            {pick(language, marketingCopy.footer.docsLink)}
          </Link>
          <span className="mx-2 text-zinc-700">·</span>
          <Link href="/pricing" className="text-zinc-500 transition-colors hover:text-zinc-400">
            {pick(language, marketingCopy.footer.pricingLink)}
          </Link>
          <span className="mx-2 text-zinc-700">·</span>
          <a
            href="/llms.txt"
            className="text-zinc-500 transition-colors hover:text-zinc-400"
            rel="noopener"
          >
            {pick(language, marketingCopy.footer.llmsForAi)}
          </a>
          <span className="mx-2 text-zinc-700">·</span>
          © {year} Global Score Agent. {pick(language, marketingCopy.footer.rights)}
        </p>
      </div>
    </footer>
  );
}


