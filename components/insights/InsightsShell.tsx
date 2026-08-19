'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Globe, Home } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import {
  insightsHref,
  isInsightsArticlePath,
  withInsightsLang,
} from '@/lib/insights/site';
import { SITE_URL } from '@/lib/seo/site';

const INSIGHTS_BACKGROUND_VIDEO = '/blog_background.mp4';

const headerActionClassName =
  'flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-amber-200/30 hover:text-amber-200 sm:gap-2 sm:px-3';

type InsightsShellProps = {
  children: ReactNode;
  onInsightsHost: boolean;
};

export default function InsightsShell({ children, onInsightsHost }: InsightsShellProps) {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();
  const indexHref = withInsightsLang(insightsHref(undefined, onInsightsHost), language);
  const isArticlePage = isInsightsArticlePath(pathname, onInsightsHost);

  return (
    <div className="insights-theme relative min-h-screen">
      <video
        className="insights-bg-video pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      >
        <source src={INSIGHTS_BACKGROUND_VIDEO} type="video/mp4" />
      </video>
      <div className="insights-bg-scrim" aria-hidden />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="insights-glass sticky top-0 z-20 border-b border-white/10">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-6">
            <Link href={indexHref} className="group flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-gsa.png"
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold tracking-wide text-zinc-100 group-hover:text-amber-200">
                  {pick(language, insightsCopy.brand)}
                </span>
                <span className="truncate text-[11px] text-zinc-500">
                  {pick(language, insightsCopy.tagline)}
                </span>
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              {isArticlePage ? (
                <Link
                  href={indexHref}
                  className={headerActionClassName}
                  aria-label={pick(language, insightsCopy.headerAllNotesAria)}
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  <span className="hidden font-medium sm:inline">
                    {pick(language, insightsCopy.backToIndex)}
                  </span>
                </Link>
              ) : null}
              <a
                href={SITE_URL}
                className={headerActionClassName}
                aria-label={pick(language, insightsCopy.headerHomeAria)}
              >
                <Home size={16} className="shrink-0" />
                <span className="hidden font-medium sm:inline">
                  {pick(language, insightsCopy.headerHome)}
                </span>
              </a>
              <button
                type="button"
                onClick={toggleLanguage}
                className={headerActionClassName}
                aria-label={pick(language, insightsCopy.languageAria)}
              >
                <Globe size={16} className="shrink-0" />
                <span className="font-medium">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 md:py-16">{children}</main>

        <footer className="insights-glass border-t border-white/10">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-zinc-500">
            <p>{pick(language, insightsCopy.footerAttribution)}</p>
            <a
              href={SITE_URL}
              className="w-fit text-zinc-400 transition-colors hover:text-amber-200"
            >
              {pick(language, insightsCopy.footerHome)}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
