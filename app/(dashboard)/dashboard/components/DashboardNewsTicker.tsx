'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import type { DashboardNewsItem } from '@/lib/web-dashboard/dashboard-news';

type DashboardNewsApiResponse = {
  success: boolean;
  news?: DashboardNewsItem[];
  error?: string;
};

function buildTickerText(news: DashboardNewsItem[], lang: 'es' | 'en'): string {
  const messages = news
    .map((item) => (lang === 'es' ? item.message_es : item.message_en))
    .filter((message) => message.trim().length > 0);

  return messages.join(' - ');
}

export default function DashboardNewsTicker() {
  const { lang, theme, t } = useLanguage();
  const isDark = theme === 'dark';
  const [news, setNews] = useState<DashboardNewsItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/dashboard/news', { credentials: 'include' });
        const data = (await res.json()) as DashboardNewsApiResponse;
        if (data.success) {
          setNews(data.news ?? []);
        }
      } catch {
        setNews([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const tickerText = useMemo(() => buildTickerText(news, lang), [news, lang]);
  const displayText = tickerText || t.newsTickerEmpty;
  const hasActiveNews = tickerText.length > 0;

  const marqueeDuration = useMemo(
    () => Math.max(20, displayText.length * 0.15),
    [displayText],
  );

  if (!loaded) {
    return null;
  }

  return (
    <div
      className={`shrink-0 border-t px-4 py-2 ${
        isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-800'
      }`}
      role="region"
      aria-label={lang === 'es' ? 'Noticias del dashboard' : 'Dashboard news'}
    >
      {!hasActiveNews || prefersReducedMotion ? (
        <p className="truncate text-sm text-zinc-500">{displayText}</p>
      ) : (
        <div className="dashboard-news-marquee-viewport">
          <div
            className="dashboard-news-marquee-track text-sm"
            style={{ ['--marquee-duration' as string]: `${marqueeDuration}s` }}
          >
            <span className="pr-16">{displayText}</span>
            <span className="pr-16" aria-hidden="true">
              {displayText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
