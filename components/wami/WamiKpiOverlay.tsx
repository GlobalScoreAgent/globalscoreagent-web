'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiKpiLabels } from '@/content/wami/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import { fetchApiNoStore } from '@/lib/api/client-fetch';
import { HUMI_DISTRIBUTION_KEYS, type WamiPageKpi } from '@/lib/web-page/statistics';
import KpiPanelSkeleton from '@/components/marketing/shared/KpiPanelSkeleton';
import DistributionKpiCard from '@/components/marketing/shared/DistributionKpiCard';
import { kpiGridGap, kpiLastUpdated } from '@/components/marketing/shared/kpiTypography';
import NonceTotalKpiCard from './kpi/NonceTotalKpiCard';
import WalletsAnalysedKpiCard from './kpi/WalletsAnalysedKpiCard';
import WalletLinkKpiCard from './kpi/WalletLinkKpiCard';
import WalletCategoriesKpiCard from './kpi/WalletCategoriesKpiCard';

const WAMI_DISTRIBUTION_LABELS = {
  categoryHeader: wamiKpiLabels.distributionCategoryHeader,
  countSubtitle: wamiKpiLabels.distributionWalletsSubtitle,
  avgSubtitle: wamiKpiLabels.distributionAvgSubtitle,
  scoreRangeInfoLabel: wamiKpiLabels.scoreRangeInfoLabel,
};

type WamiKpiOverlayProps = {
  className?: string;
};

type LoadStatus = 'loading' | 'ready' | 'error';

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

export default function WamiKpiOverlay({ className = '' }: WamiKpiOverlayProps) {
  const { language } = useLanguage();
  const [kpi, setKpi] = useState<WamiPageKpi | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetchApiNoStore('/api/web-page/statistics?page=wami');
      const json = await res.json();

      if (json.success && json.data) {
        setKpi(json.data as WamiPageKpi);
        setStatus('ready');
        return;
      }
    } catch {
      /* error below */
    }

    setKpi(null);
    setStatus('error');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return <KpiPanelSkeleton className={className} layout="wami" />;
  }

  if (status === 'error' || !kpi) {
    return (
      <div
        className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
      >
        <p className={kpiLastUpdated}>
          {pick(language, wamiKpiLabels.lastUpdated)}: —
        </p>
        <p className="mb-2 text-xs text-zinc-500">{pick(language, wamiKpiLabels.unavailable)}</p>
        <button
          type="button"
          onClick={load}
          className="self-start rounded border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
        >
          {pick(language, wamiKpiLabels.retry)}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
    >
      <p className={kpiLastUpdated}>
        {pick(language, wamiKpiLabels.lastUpdated)}:{' '}
        {formatLastUpdated(kpi.last_updated, language)}
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
        <div className={`grid grid-cols-2 ${kpiGridGap}`}>
          <WalletsAnalysedKpiCard walletAnalysed={kpi.wallet_analysed} />
          <NonceTotalKpiCard nonceTotal={kpi.nonce_total} nonceDelta={kpi.nonce_delta} />
          <WalletLinkKpiCard
            valid={kpi.wallet_link_agent_valid}
            notValid={kpi.wallet_link_agent_not_valid}
          />
          {HUMI_DISTRIBUTION_KEYS.map((key) => (
            <DistributionKpiCard
              key={key}
              band={wamiKpiLabels.distribution[key].band}
              scoreRange={wamiKpiLabels.distribution[key].scoreRange}
              count={kpi.distribution[key].count}
              avg={kpi.distribution[key].avg}
              labels={WAMI_DISTRIBUTION_LABELS}
            />
          ))}
          <WalletCategoriesKpiCard categories={kpi.wallet_categories} />
        </div>
      </div>
    </div>
  );
}
