'use client';

import { useCallback, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiKpiLabels } from '@/content/humi/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import { fetchWebPageStatistics } from '@/lib/api/client-fetch';
import { useStatisticsKpiRefresh } from '@/lib/api/use-statistics-kpi-refresh';
import { HUMI_MATURITY_KEYS, type HumiPageKpi } from '@/lib/web-page/statistics';
import KpiPanelSkeleton from '@/components/marketing/shared/KpiPanelSkeleton';
import { kpiGridGap, kpiLastUpdated } from '@/components/marketing/shared/kpiTypography';
import NumericKpiCard from '@/components/marketing/home/kpi/NumericKpiCard';
import BestAgentKpiCard from './kpi/BestAgentKpiCard';
import DecimalKpiCard from './kpi/DecimalKpiCard';
import DistributionKpiCard from './kpi/DistributionKpiCard';

type HumiKpiOverlayProps = {
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

export default function HumiKpiOverlay({ className = '' }: HumiKpiOverlayProps) {
  const { language } = useLanguage();
  const [kpi, setKpi] = useState<HumiPageKpi | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setStatus('loading');
    }
    try {
      const res = await fetchWebPageStatistics('humi');
      const json = await res.json();

      if (json.success && json.data) {
        setKpi(json.data as HumiPageKpi);
        setStatus('ready');
        return;
      }
    } catch {
      /* error below */
    }

    if (!options?.silent) {
      setKpi(null);
      setStatus('error');
    }
  }, []);

  useStatisticsKpiRefresh(load);

  if (status === 'loading') {
    return <KpiPanelSkeleton className={className} cardCount={8} />;
  }

  if (status === 'error' || !kpi) {
    return (
      <div
        className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
      >
        <p className="mb-2 shrink-0 px-0.5 text-right text-[10px] text-zinc-500 sm:text-xs">
          {pick(language, humiKpiLabels.lastUpdated)}: —
        </p>
        <p className="mb-2 text-xs text-zinc-500">{pick(language, humiKpiLabels.unavailable)}</p>
        <button
          type="button"
          onClick={load}
          className="self-start rounded border border-zinc-700 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
        >
          {pick(language, humiKpiLabels.retry)}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
    >
      <p className={kpiLastUpdated}>
        {pick(language, humiKpiLabels.lastUpdated)}:{' '}
        {formatLastUpdated(kpi.last_updated, language)}
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
        <div className={`grid grid-cols-2 ${kpiGridGap}`}>
          <BestAgentKpiCard name={kpi.best_agent} score={kpi.best_agent_score} />
          <NumericKpiCard
            label={humiKpiLabels.totalAgentsAnalysed}
            value={kpi.total_agents_analysed}
          />
          <DecimalKpiCard label={humiKpiLabels.avgTop100} value={kpi.avg_top_100} />
          {HUMI_MATURITY_KEYS.map((key) => (
            <DistributionKpiCard
              key={key}
              band={humiKpiLabels.distribution[key].band}
              scoreRange={humiKpiLabels.distribution[key].scoreRange}
              userDescription={humiKpiLabels.distribution[key].userDescription}
              count={kpi.distribution[key].count}
              avg={kpi.distribution[key].avg}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
