'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { portalStats } from '@/content/marketing/stats';
import { mainKpiLabels } from '@/content/marketing/kpi-labels';
import {
  HOME_GLOBAL_KEYS,
  HOME_TOP_KEYS,
  kpiMobileWrapperClass,
} from './kpi-layout';
import { pick } from '@/content/marketing/i18n';
import { fetchApiNoStore } from '@/lib/api/client-fetch';
import type { MainPageKpi } from '@/lib/web-page/statistics';
import KpiPanelSkeleton from '@/components/marketing/shared/KpiPanelSkeleton';
import { kpiGridGap, kpiLastUpdated } from '@/components/marketing/shared/kpiTypography';
import ChainsKpiCard from './kpi/ChainsKpiCard';
import NumericKpiCard from './kpi/NumericKpiCard';
import TopKpiCard from './kpi/TopKpiCard';

type KpiOverlayProps = {
  className?: string;
};

type LoadStatus = 'loading' | 'ready' | 'degraded';

function buildFallbackKpi(): MainPageKpi {
  const agents = portalStats.find((s) => s.id === 'agents')?.value ?? 0;
  const owners = portalStats.find((s) => s.id === 'wallets')?.value ?? 0;
  const active = portalStats.find((s) => s.id === 'active')?.value ?? 0;
  return {
    last_updated: new Date().toISOString(),
    active_chains: [],
    global_totals: {
      agent_new: 0,
      agent_total: agents,
      owner_total: owners,
      agent_active: active,
      feedback_new: 0,
      feedback_total: 0,
      agent_with_feedback: 0,
    },
    top_new_agents: { value: 0, chain_name: '—' },
    top_total_agents: { value: 0, chain_name: '—' },
    top_total_owners: { value: 0, chain_name: '—' },
    top_new_feedbacks: { value: 0, chain_name: '—' },
    top_total_feedbacks: { value: 0, chain_name: '—' },
  };
}

function formatLastUpdated(iso: string, language: 'es' | 'en'): string {
  try {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function KpiOverlay({ className = '' }: KpiOverlayProps) {
  const { language } = useLanguage();
  const [kpi, setKpi] = useState<MainPageKpi | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetchApiNoStore('/api/web-page/statistics?page=main');
      const json = await res.json();

      if (json.success && json.data) {
        setKpi(json.data as MainPageKpi);
        setStatus('ready');
        return;
      }
    } catch {
      /* degraded below */
    }

    setKpi(buildFallbackKpi());
    setStatus('degraded');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return <KpiPanelSkeleton className={className} layout="home" />;
  }

  if (!kpi) {
    return (
      <div
        className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
      >
        <p className="mb-2 shrink-0 px-0.5 text-right text-[10px] text-zinc-500 sm:text-xs">
          {pick(language, mainKpiLabels.lastUpdated)}: —
        </p>
        <p className="mb-2 text-xs text-zinc-500">{pick(language, mainKpiLabels.unavailable)}</p>
        <button
          type="button"
          onClick={load}
          className="self-start rounded border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
        >
          {pick(language, mainKpiLabels.retry)}
        </button>
      </div>
    );
  }

  const isDegraded = status === 'degraded';

  return (
    <div
      className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
    >
      <p className={kpiLastUpdated}>
        {pick(language, mainKpiLabels.lastUpdated)}:{' '}
        {formatLastUpdated(kpi.last_updated, language)}
        {isDegraded ? pick(language, mainKpiLabels.localFallback) : ''}
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
        <div className={`grid grid-cols-2 ${kpiGridGap}`}>
          <ChainsKpiCard
            chains={isDegraded ? [] : kpi.active_chains}
            showEmptyMessage={isDegraded}
          />
          {HOME_GLOBAL_KEYS.map((key) => {
            const metric = mainKpiLabels.global[key];
            return (
              <div key={key} className={kpiMobileWrapperClass(key)}>
                <NumericKpiCard
                  label={metric.label}
                  tooltip={metric.tooltip}
                  value={kpi.global_totals[key]}
                />
              </div>
            );
          })}
          {HOME_TOP_KEYS.map((key) => {
            const metric = mainKpiLabels.top[key];
            const topMetric = kpi[key];
            return (
              <div key={key} className={kpiMobileWrapperClass(key)}>
                <TopKpiCard
                  label={metric.label}
                  tooltip={metric.tooltip}
                  value={topMetric.value}
                  chainName={isDegraded ? null : topMetric.chain_name}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
