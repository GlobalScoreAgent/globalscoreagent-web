'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';

type MarketingTopBarProps = {
  overlay?: boolean;
  heroSectionId?: string;
};

export default function MarketingTopBar({
  overlay = false,
  heroSectionId,
}: MarketingTopBarProps) {
  const { language, toggleLanguage } = useLanguage();
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!overlay || !heroSectionId) {
      setScrolledPastHero(false);
      return;
    }

    const hero = document.getElementById(heroSectionId);
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [overlay, heroSectionId]);

  const isTransparent = overlay && !scrolledPastHero;

  const headerClass = [
    'z-30 flex h-16 items-center justify-end px-4 transition-colors duration-300 md:px-6',
    overlay ? 'fixed left-16 right-0 top-0' : 'sticky top-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md',
    isTransparent && 'border-transparent bg-transparent',
    overlay && scrolledPastHero && 'border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md',
  ]
    .filter(Boolean)
    .join(' ');

  const languageButtonClass = [
    'flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-colors hover:border-gold/30 hover:text-gold sm:px-4 sm:py-2.5',
    isTransparent
      ? 'border-zinc-700/80 bg-zinc-950/40 text-zinc-200 backdrop-blur-sm'
      : 'border-zinc-700 text-zinc-300',
  ].join(' ');

  return (
    <header className={headerClass}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleLanguage}
          className={languageButtonClass}
          aria-label={language === 'es' ? 'Cambiar idioma' : 'Change language'}
        >
          <Globe size={18} className="shrink-0" />
          <span className="font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {language.toUpperCase()}
          </span>
        </button>
        <Link
          href={buildAuthLoginUrl('/dashboard')}
          className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95 md:px-8 md:py-3 md:text-base"
        >
          <span className="md:hidden">{pick(language, marketingCopy.topBar.accessDashboardShort)}</span>
          <span className="hidden md:inline">{pick(language, marketingCopy.topBar.accessDashboard)}</span>
        </Link>
      </div>
    </header>
  );
}
