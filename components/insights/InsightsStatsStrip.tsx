'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { insightsCopy } from '@/content/insights/copy';
import { pick } from '@/content/marketing/i18n';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import { fetchWebPageStatistics } from '@/lib/api/client-fetch';
import { chainLogoUrlFromChainName } from '@/lib/chainPublicLogo';
import { insightsStatsFromMainKpi } from '@/lib/insights/stats';
import type { MainPageKpi } from '@/lib/web-page/statistics';

type InsightsStatsStripProps = {
  lang: 'es' | 'en';
};

const STAT_LABELS = {
  agents: insightsCopy.statsAgents,
  chains: insightsCopy.statsChains,
  feedback: insightsCopy.statsFeedback,
  owners: insightsCopy.statsOwners,
} as const;

function chainInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function InsightsChainLogos({ chains }: { chains: string[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (chains.length === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-center">
      {chains.map((chain, index) => {
        const logoSrc = chainLogoUrlFromChainName(chain);
        const isHovered = hovered === chain;
        return (
          <span
            key={chain}
            className="group/chain relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 ring-2 ring-black/40 transition-transform hover:scale-110"
            style={{
              marginLeft: index === 0 ? 0 : -6,
              zIndex: isHovered ? 50 : chains.length - index,
            }}
            onMouseEnter={() => setHovered(chain)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="relative h-full w-full overflow-hidden rounded-full">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={chain}
                  fill
                  className="object-contain p-[3px]"
                  sizes="32px"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[8px] font-semibold text-zinc-400">
                  {chainInitials(chain)}
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-zinc-100 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover/chain:opacity-100">
              {chain}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function InsightsStatsStrip({ lang }: InsightsStatsStripProps) {
  const [kpi, setKpi] = useState<MainPageKpi | null>(null);
  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  const load = useCallback(async () => {
    try {
      const res = await fetchWebPageStatistics('main');
      const json = (await res.json()) as { success?: boolean; data?: MainPageKpi };
      if (json.success && json.data) {
        setKpi(json.data);
      }
    } catch {
      setKpi(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!kpi) return null;

  const stats = insightsStatsFromMainKpi(kpi);

  return (
    <section aria-label={pick(lang, insightsCopy.statsKicker)}>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        {pick(lang, insightsCopy.statsKicker)}
      </p>
      <div className="grid grid-cols-2 items-stretch gap-3 overflow-visible md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="insights-card insights-glass flex min-h-[10.5rem] flex-col items-center justify-center overflow-visible rounded-2xl border border-white/10 px-4 py-6 text-center md:min-h-[11.5rem]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {pick(lang, STAT_LABELS[stat.key])}
            </p>
            <p className="mt-3 text-4xl font-semibold tabular-nums leading-none tracking-tight text-zinc-50 md:text-[2.35rem]">
              <AnimatedCounter target={stat.value} locale={locale} />
            </p>
            {stat.key === 'chains' ? <InsightsChainLogos chains={kpi.active_chains} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
