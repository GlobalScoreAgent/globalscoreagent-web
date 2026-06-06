// app/(dashboard)/dashboard/humi/page.tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { AgentDetailIndexScoreCard } from '@/components/dashboard/AgentDetailIndexScoreCard';
import { AgentHumiPillarScoresCard } from '@/components/dashboard/AgentHumiPillarScoresCard';
import { AgentHumiPillarSummaryCard } from '@/components/dashboard/AgentHumiPillarSummaryCard';
import { AgentHumiPillarTrendCard } from '@/components/dashboard/AgentHumiPillarTrendCard';
import { AgentHumiTrendCard } from '@/components/dashboard/AgentHumiTrendCard';
import { useDashboardTitleOverride } from '@/app/(dashboard)/dashboard/components/DashboardTitleOverrideContext';
import { useLanguage } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { getHumiScoreColor, getHumiScoreText } from '@/lib/agentHumiDisplay';
import { formatDashboardDateUtc } from '@/lib/formatDashboardDate';
import { parseIndexHumiRow, resolveHumiCategory, type IndexHumiCardData } from '@/lib/indexHumi';
import {
  buildPillarSummaryChartPoints,
  getPillarSummaryRaw,
  isPillarSummaryMissing,
  parsePillarSummary,
} from '@/lib/indexHumiPillarSummary';
import type { PillarSummaryBlockId } from '@/lib/indexHumiPillarSummary';
import {
  buildHumiPillarChartPoints,
  getPillarTrendRaw,
  isPillarTrendRawMissing,
  type HumiPillarId,
} from '@/lib/indexHumiPillars';
import { parseHumiLast30Days, parseHumiMonthlyTracking } from '@/lib/indexHumiSeries';
import { cn } from '@/lib/utils';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';

type AgentDetailRow = Record<string, unknown>;

export default function HumiIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams?.get('agentId') ?? '';
  const { t, theme, lang } = useLanguage();
  const { setTitleOverride } = useDashboardTitleOverride();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<AgentDetailRow | null>(null);
  const [indexHumi, setIndexHumi] = useState<IndexHumiCardData | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<HumiPillarId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = useCallback(
    (dateString: string | null | undefined) =>
      formatDashboardDateUtc(dateString, lang === 'es' ? 'es-ES' : 'en-US', t.notAvailable),
    [lang, t.notAvailable],
  );

  useEffect(() => {
    if (!agentId) return;
    router.replace(`/dashboard/agents/${encodeURIComponent(agentId)}/humi`);
  }, [agentId, router]);

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      setIndexHumi(null);
      setSelectedPillar(null);
      setError(null);
      setTitleOverride(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setAgent(null);
    setIndexHumi(null);
    setSelectedPillar(null);

    (async () => {
      try {
        const [agentRes, humiRes] = await Promise.all([
          fetch(`/api/dashboard/agents/${encodeURIComponent(agentId)}`),
          fetch(`/api/dashboard/agents/${encodeURIComponent(agentId)}/humi`),
        ]);

        const agentBody = await agentRes.json().catch(() => ({}));
        const humiBody = await humiRes.json().catch(() => ({}));

        if (cancelled) return;

        if (!agentRes.ok || !agentBody?.data) {
          setError(t.agentDetailLoadError);
          setAgent(null);
          setIndexHumi(null);
          return;
        }

        setAgent(agentBody.data as AgentDetailRow);

        if (humiRes.ok && humiBody?.data) {
          setIndexHumi(parseIndexHumiRow(humiBody.data));
        } else if (humiRes.status === 404) {
          setIndexHumi(null);
        } else if (!humiRes.ok && humiRes.status !== 404) {
          console.error('Index HUMI fetch failed:', humiBody);
          setIndexHumi(null);
        }
      } catch {
        if (!cancelled) {
          setError(t.agentDetailLoadError);
          setAgent(null);
          setIndexHumi(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId, setTitleOverride, t.agentDetailLoadError]);

  useEffect(() => {
    if (!agentId) return;

    if (!agent) {
      setTitleOverride(`${agentId} ${t.agentHumiPageTitleSuffix}`);
      return;
    }

    const name =
      typeof agent?.name === 'string' && String(agent.name).trim().length > 0
        ? String(agent.name)
        : agentId;

    setTitleOverride(`${name} ${t.agentHumiPageTitleSuffix}`);

    return () => setTitleOverride(null);
  }, [agent, agentId, setTitleOverride, t.agentHumiPageTitleSuffix]);

  const title = typeof agent?.name === 'string' ? agent.name : '';

  const humiCategory = useMemo(
    () => resolveHumiCategory(
      indexHumi?.madurity_level,
      indexHumi?.humi_score_category,
      indexHumi?.humi_score,
    ),
    [indexHumi?.madurity_level, indexHumi?.humi_score, indexHumi?.humi_score_category],
  );

  const humiColor = getHumiScoreColor(humiCategory);
  const humiText = getHumiScoreText(humiCategory, t);

  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  const dailySeries = useMemo(
    () => parseHumiLast30Days(indexHumi?.humi_score_last_30_days, locale),
    [indexHumi?.humi_score_last_30_days, locale],
  );

  const monthlySeries = useMemo(
    () => parseHumiMonthlyTracking(indexHumi?.humi_score_tracking, locale),
    [indexHumi?.humi_score_tracking, locale],
  );

  const pillarPoints = useMemo(
    () =>
      buildHumiPillarChartPoints(indexHumi, {
        history: t.agentHumiPillarHistory,
        usage: t.agentHumiPillarUsage,
        measure: t.agentHumiPillarMeasure,
        information: t.agentHumiPillarInformation,
      }),
    [
      indexHumi,
      t.agentHumiPillarHistory,
      t.agentHumiPillarUsage,
      t.agentHumiPillarMeasure,
      t.agentHumiPillarInformation,
    ],
  );

  const pillarLabels = useMemo(
    (): Record<HumiPillarId, string> => ({
      history: t.agentHumiPillarHistory,
      usage: t.agentHumiPillarUsage,
      measure: t.agentHumiPillarMeasure,
      information: t.agentHumiPillarInformation,
    }),
    [
      t.agentHumiPillarHistory,
      t.agentHumiPillarUsage,
      t.agentHumiPillarMeasure,
      t.agentHumiPillarInformation,
    ],
  );

  const pillarTrendData = useMemo(() => {
    if (!selectedPillar) {
      return {
        selectedPillarId: null as HumiPillarId | null,
        pillarLabel: null as string | null,
        dailySeries: [] as ReturnType<typeof parseHumiLast30Days>,
        monthlySeries: [] as ReturnType<typeof parseHumiMonthlyTracking>,
        dailyRawMissing: false,
        monthlyRawMissing: false,
      };
    }
    const raw = getPillarTrendRaw(indexHumi, selectedPillar);
    const dailyRawMissing = isPillarTrendRawMissing(raw.last30Days);
    const monthlyRawMissing = isPillarTrendRawMissing(raw.tracking);
    return {
      selectedPillarId: selectedPillar,
      pillarLabel: pillarLabels[selectedPillar],
      dailySeries: dailyRawMissing
        ? []
        : parseHumiLast30Days(raw.last30Days, locale, 'pillar_score'),
      monthlySeries: monthlyRawMissing
        ? []
        : parseHumiMonthlyTracking(raw.tracking, locale, 'avg_score'),
      dailyRawMissing,
      monthlyRawMissing,
    };
  }, [selectedPillar, indexHumi, locale, pillarLabels]);

  const blockLabels = useMemo(
    (): Record<PillarSummaryBlockId, string> => ({
      basic: t.agentHumiPillarBlockBasic,
      intermediate: t.agentHumiPillarBlockIntermediate,
      advanced: t.agentHumiPillarBlockAdvanced,
    }),
    [t.agentHumiPillarBlockBasic, t.agentHumiPillarBlockIntermediate, t.agentHumiPillarBlockAdvanced],
  );

  const pillarSummaryData = useMemo(() => {
    if (!selectedPillar) {
      return {
        selectedPillarId: null as HumiPillarId | null,
        pillarLabel: null as string | null,
        summaryPoints: [] as ReturnType<typeof buildPillarSummaryChartPoints>,
        summaryMissing: false,
      };
    }
    const raw = getPillarSummaryRaw(indexHumi, selectedPillar);
    const summaryMissing = isPillarSummaryMissing(raw);
    const blocks = summaryMissing ? null : parsePillarSummary(raw);
    const summaryParseFailed = !summaryMissing && blocks === null;
    return {
      selectedPillarId: selectedPillar,
      pillarLabel: pillarLabels[selectedPillar],
      summaryPoints: blocks ? buildPillarSummaryChartPoints(blocks, blockLabels) : [],
      summaryMissing: summaryMissing || summaryParseFailed,
    };
  }, [selectedPillar, indexHumi, pillarLabels, blockLabels]);

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  if (!agentId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <p className={cn('text-sm', muted)}>{t.agentHumiMissingAgentId}</p>
        <Link
          href="/dashboard/agents"
          className={cn(
            'inline-flex items-center justify-center rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors',
            isDark
              ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-100'
              : 'border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900',
          )}
        >
          {t.agentHumiGoToDirectory}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex min-h-[50vh] items-center justify-center', muted)}>
        <p>{t.agentDetailLoading}</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className={cn('flex min-h-[50vh] flex-col items-center justify-center px-6 text-center', muted)}>
        <p className="max-w-lg text-lg">{t.agentDetailLoadError}</p>
      </div>
    );
  }

  const backLinkClass = cn(
    'inline-flex shrink-0 items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-medium leading-snug transition-colors',
    'max-w-[10rem] whitespace-normal text-center',
    isDark
      ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-100'
      : 'border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900',
  );

  return (
    <div className={cn('min-h-full', isDark ? 'text-zinc-100' : 'text-zinc-900')}>
    <div className="mx-auto max-w-7xl space-y-6 px-6 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {agent.on_chain_id ? (
            <span
              className={`w-fit max-w-full truncate rounded-full border px-3 py-1 font-mono text-xs ${
                isDark
                  ? 'border-gray-600 bg-white/5 text-gray-300'
                  : 'border-zinc-300 bg-zinc-100 text-zinc-700'
              }`}
            >
              {String(agent.on_chain_id)}
            </span>
          ) : null}
          <h1 className="break-words text-4xl font-bold tracking-tight sm:text-5xl">
            {title || agentId}
          </h1>
          <p className={cn('text-sm', muted)}>
            {t.agentHumiCalculatedAt}{' '}
            <span className="tabular-nums">
              {formatDate(indexHumi?.current_humi_score_calculated_at)}
            </span>
          </p>
        </div>

        <Link
          href={`/dashboard/agents/${encodeURIComponent(agentId)}`}
          className={cn(backLinkClass, 'self-start')}
        >
          {t.agentHumiBackToOverview}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col gap-4 lg:min-h-0">
          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            accentHex={humiColor}
            className="w-full"
            contentClassName="p-6"
          >
            <h2 className={cn('mb-4 text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
              {t.agentHumiIndexScoreTitle}
            </h2>
            <AgentDetailIndexScoreCard
              bare
              hideHeader
              categoryPlacement="below"
              score={indexHumi?.humi_score ?? null}
              filterTier={humiCategory}
              filterLabel={humiText}
              accentColor={humiColor}
              notAvailableLabel={t.notAvailable}
              isDark={isDark}
              hidePlusButton
            />
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            accentHex={humiColor}
            className="w-full"
            contentClassName="p-6"
          >
            <AgentHumiPillarScoresCard
              points={pillarPoints}
              selectedPillarId={selectedPillar}
              onPillarSelect={setSelectedPillar}
              accentColor={humiColor}
              isDark={isDark}
              locale={locale}
              t={t}
            />
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            accentHex={humiColor}
            className="w-full"
            contentClassName="p-6"
          >
            <AgentHumiPillarSummaryCard
              selectedPillarId={pillarSummaryData.selectedPillarId}
              pillarLabel={pillarSummaryData.pillarLabel}
              summaryPoints={pillarSummaryData.summaryPoints}
              summaryMissing={pillarSummaryData.summaryMissing}
              accentColor={humiColor}
              isDark={isDark}
              locale={locale}
              t={t}
            />
          </AgentDetailCard>
        </div>

        <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
          <AgentDetailCard
            isDark={isDark}
            variant="transactional"
            accentHex={humiColor}
            className="w-full min-w-0 shrink-0"
            contentClassName="p-8"
          >
            <AgentHumiTrendCard
              dailySeries={dailySeries}
              monthlySeries={monthlySeries}
              accentColor={humiColor}
              isDark={isDark}
              locale={locale}
              t={t}
            />
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="transactional"
            accentHex={humiColor}
            className="flex w-full min-w-0 flex-col lg:min-h-0 lg:flex-1"
            contentClassName="flex min-h-0 flex-1 flex-col p-8"
          >
            <AgentHumiPillarTrendCard
              selectedPillarId={pillarTrendData.selectedPillarId}
              pillarLabel={pillarTrendData.pillarLabel}
              dailySeries={pillarTrendData.dailySeries}
              monthlySeries={pillarTrendData.monthlySeries}
              dailyRawMissing={pillarTrendData.dailyRawMissing}
              monthlyRawMissing={pillarTrendData.monthlyRawMissing}
              accentColor={humiColor}
              isDark={isDark}
              locale={locale}
              t={t}
            />
          </AgentDetailCard>
        </div>
      </div>
    </div>
    </div>
  );
}
