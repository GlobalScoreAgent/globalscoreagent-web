'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import {
  AgentHumiBlockDetailsCard,
  buildWamiBlockDetailsRows,
} from '@/components/dashboard/AgentHumiBlockDetailsCard';
import { AgentHumiPillarDetailsCard } from '@/components/dashboard/AgentHumiPillarDetailsCard';
import { AgentHumiPillarSummaryCard } from '@/components/dashboard/AgentHumiPillarSummaryCard';
import { AgentHumiTrendCard } from '@/components/dashboard/AgentHumiTrendCard';
import { AgentWamiAgentSummaryCard } from '@/components/dashboard/AgentWamiAgentSummaryCard';
import { AgentWamiWalletAnalysisCard } from '@/components/dashboard/AgentWamiWalletAnalysisCard';
import { AgentWamiWalletPillarScoresCard } from '@/components/dashboard/AgentWamiWalletPillarScoresCard';
import { useDashboardTitleOverride } from '@/app/(dashboard)/dashboard/components/DashboardTitleOverrideContext';
import { useLanguage } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  getAgentDetailMaturityTier,
  getHumiMaturityColor,
  getHumiMaturityText,
  normalizeAgentHumiScore,
} from '@/lib/agentHumiDisplay';
import {
  getBlockPercentBandColor,
  getPillarScoreBandColor,
  HUMI_BAND_NEUTRAL,
} from '@/lib/indexHumiScoreColors';
import { formatDashboardDateUtc } from '@/lib/formatDashboardDate';
import {
  hasPillarExecutiveSummary,
  parsePillarExecutiveSummaryRows,
  type PillarExecutiveSummaryKey,
} from '@/lib/indexHumiPillarExecutiveSummary';
import {
  buildPillarSummaryChartPoints,
  getPillarSummaryBlockMax,
  getPillarSummaryBlockScore,
  getPillarSummaryItemsByBlock,
  hasPillarSummaryItemsForBlock,
  isPillarSummaryMissing,
  parsePillarSummary,
  resolveDefaultPillarSummaryBlockId,
} from '@/lib/indexHumiPillarSummary';
import type { PillarSummaryBlockId } from '@/lib/indexHumiPillarSummary';
import { getWamiIndexDetailCopy } from '@/lib/indexDetailCopy';
import { parseIndexWamiRow, resolveWamiCategory, type IndexWamiCardData } from '@/lib/indexWami';
import {
  buildWamiAgentPillarChartPoints,
  buildWamiWalletPillarChartPoints,
  getWalletPillarSummaryRawForPillar,
  getWamiPillarTrendRaw,
  isWamiTrendRawMissing,
  type WamiPillarId,
} from '@/lib/indexWamiPillars';
import {
  parseWamiIndexLast30Days,
  parseWamiIndexMonthlyTracking,
  parseWamiPillarLast30Days,
  parseWamiPillarMonthlyTracking,
} from '@/lib/indexWamiSeries';
import {
  buildWamiWalletCarouselRows,
  findWalletIndex,
  resolveDefaultWalletAddress,
  truncateWalletAddress,
} from '@/lib/indexWamiWalletData';
import {
  agentDetailApiPath,
  agentDetailPagePath,
  appendPublicLangParam,
  parseAgentRouteLookupBy,
  TOP10_AGENTS_LIST_PATH,
  type AgentRouteScope,
} from '@/lib/dashboardAgentLookup';
import { cn } from '@/lib/utils';
type AgentDetailRow = Record<string, unknown>;

function firstParamId(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : '';
  return '';
}

export function AgentWamiDetailView({ routeScope }: { routeScope: AgentRouteScope }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const agentId = firstParamId(params?.id);
  const lookupBy = parseAgentRouteLookupBy(searchParams.get('by'));
  const { t, theme, lang } = useLanguage();
  const { setTitleOverride } = useDashboardTitleOverride();
  const isDark = routeScope === 'public' ? true : theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<AgentDetailRow | null>(null);
  const [indexWami, setIndexWami] = useState<IndexWamiCardData | null>(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<WamiPillarId | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<PillarSummaryBlockId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState(false);

  const copy = useMemo(() => getWamiIndexDetailCopy(t), [t]);
  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  const walletCarouselRows = useMemo(
    () => buildWamiWalletCarouselRows(indexWami),
    [indexWami],
  );

  const selectedWalletIndex = useMemo(
    () => findWalletIndex(walletCarouselRows.map((r) => r.address), selectedWalletAddress),
    [walletCarouselRows, selectedWalletAddress],
  );

  const selectedWalletMaturity = walletCarouselRows[selectedWalletIndex]?.maturity_level ?? null;
  const walletAccentColor = getHumiMaturityColor(selectedWalletMaturity, null);

  const walletSubtitle = useMemo(
    () => (selectedWalletAddress ? truncateWalletAddress(selectedWalletAddress) : null),
    [selectedWalletAddress],
  );

  const handleWalletSelect = useCallback((address: string) => {
    setSelectedWalletAddress(address);
    setSelectedPillar(null);
    setSelectedBlock(null);
  }, []);

  const handlePillarSelect = useCallback(
    (pillarId: WamiPillarId) => {
      setSelectedPillar(pillarId);
      if (!selectedWalletAddress) return;
      const raw = getWalletPillarSummaryRawForPillar(indexWami, pillarId, selectedWalletAddress);
      setSelectedBlock(resolveDefaultPillarSummaryBlockId(raw));
    },
    [indexWami, selectedWalletAddress],
  );

  const handleBlockSelect = useCallback((blockId: PillarSummaryBlockId) => {
    setSelectedBlock(blockId);
  }, []);

  const handleCopyWallet = useCallback((text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopyToast(true);
      window.setTimeout(() => setCopyToast(false), 2000);
    });
  }, []);

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      const row = walletCarouselRows[index];
      if (row?.address) handleWalletSelect(row.address);
    },
    [walletCarouselRows, handleWalletSelect],
  );

  const formatDate = useCallback(
    (dateString: string | null | undefined) =>
      formatDashboardDateUtc(dateString, locale, t.notAvailable),
    [locale, t.notAvailable],
  );

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      setIndexWami(null);
      setSelectedWalletAddress(null);
      setSelectedPillar(null);
      setSelectedBlock(null);
      setError(null);
      setTitleOverride(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setAgent(null);
    setIndexWami(null);
    setSelectedWalletAddress(null);
    setSelectedPillar(null);
    setSelectedBlock(null);

    (async () => {
      try {
        const [agentRes, wamiRes] = await Promise.all([
          fetch(agentDetailApiPath(agentId, lookupBy, '', routeScope), {
            credentials: routeScope === 'dashboard' ? 'include' : 'same-origin',
          }),
          fetch(agentDetailApiPath(agentId, lookupBy, '/wami', routeScope), {
            credentials: routeScope === 'dashboard' ? 'include' : 'same-origin',
          }),
        ]);

        const agentBody = await agentRes.json().catch(() => ({}));
        const wamiBody = await wamiRes.json().catch(() => ({}));

        if (cancelled) return;

        if (!agentRes.ok || !agentBody?.data) {
          setError(t.agentDetailLoadError);
          setAgent(null);
          setIndexWami(null);
          return;
        }

        setAgent(agentBody.data as AgentDetailRow);

        if (wamiRes.ok && wamiBody?.data) {
          const parsed = parseIndexWamiRow(wamiBody.data);
          setIndexWami(parsed);
          setSelectedWalletAddress(resolveDefaultWalletAddress(parsed));
        } else if (wamiRes.status === 404) {
          setIndexWami(null);
        } else if (!wamiRes.ok && wamiRes.status !== 404) {
          console.error('Index WAMI fetch failed:', wamiBody);
          setIndexWami(null);
        }
      } catch {
        if (!cancelled) {
          setError(t.agentDetailLoadError);
          setAgent(null);
          setIndexWami(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId, lookupBy, routeScope, setTitleOverride, t.agentDetailLoadError]);

  useEffect(() => {
    if (routeScope !== 'dashboard') {
      setTitleOverride(null);
      return;
    }
    if (!agentId) return;

    if (!agent) {
      setTitleOverride(`${agentId} ${t.agentWamiPageTitleSuffix}`);
      return;
    }

    const name =
      typeof agent?.name === 'string' && String(agent.name).trim().length > 0
        ? String(agent.name)
        : agentId;

    setTitleOverride(`${name} ${t.agentWamiPageTitleSuffix}`);

    return () => setTitleOverride(null);
  }, [agent, agentId, setTitleOverride, t.agentWamiPageTitleSuffix, routeScope]);

  const title = typeof agent?.name === 'string' ? agent.name : '';

  const wamiMaturity = resolveWamiCategory(indexWami?.maturity_level, indexWami?.wami_score);
  const wamiTier = getAgentDetailMaturityTier(wamiMaturity, null);
  const wamiColor = getHumiMaturityColor(wamiMaturity, null);
  const wamiText = getHumiMaturityText(wamiMaturity, null, t);
  const wamiDisplayScore = normalizeAgentHumiScore(indexWami?.wami_score);

  const pillarLabels = useMemo(
    (): Record<WamiPillarId, string> => ({
      origins: t.agentWamiPillarOrigins,
      portfolio: t.agentWamiPillarPortfolio,
      activity: t.agentWamiPillarActivity,
      multichain: t.agentWamiPillarMultichain,
    }),
    [t.agentWamiPillarOrigins, t.agentWamiPillarPortfolio, t.agentWamiPillarActivity, t.agentWamiPillarMultichain],
  );

  const agentPillarPoints = useMemo(
    () => buildWamiAgentPillarChartPoints(indexWami, pillarLabels),
    [indexWami, pillarLabels],
  );

  const walletPillarPoints = useMemo(
    () =>
      selectedWalletAddress
        ? buildWamiWalletPillarChartPoints(indexWami, selectedWalletAddress, pillarLabels)
        : [],
    [indexWami, selectedWalletAddress, pillarLabels],
  );

  const dailyIndexSeries = useMemo(
    () =>
      selectedWalletAddress
        ? parseWamiIndexLast30Days(indexWami, selectedWalletAddress, locale)
        : [],
    [indexWami, selectedWalletAddress, locale],
  );

  const monthlyIndexSeries = useMemo(
    () =>
      selectedWalletAddress
        ? parseWamiIndexMonthlyTracking(indexWami, selectedWalletAddress, locale)
        : [],
    [indexWami, selectedWalletAddress, locale],
  );

  const pillarTrendData = useMemo(() => {
    if (!selectedPillar || !selectedWalletAddress) {
      return {
        selectedPillarId: null as WamiPillarId | null,
        pillarLabel: null as string | null,
        dailySeries: [] as ReturnType<typeof parseWamiPillarLast30Days>,
        monthlySeries: [] as ReturnType<typeof parseWamiPillarMonthlyTracking>,
        dailyRawMissing: false,
        monthlyRawMissing: false,
      };
    }
    const raw = getWamiPillarTrendRaw(indexWami, selectedPillar, selectedWalletAddress);
    const dailyRawMissing = isWamiTrendRawMissing(raw.last30Days);
    const monthlyRawMissing = isWamiTrendRawMissing(raw.tracking);
    return {
      selectedPillarId: selectedPillar,
      pillarLabel: pillarLabels[selectedPillar],
      dailySeries: dailyRawMissing
        ? []
        : parseWamiPillarLast30Days(raw.last30Days, locale),
      monthlySeries: monthlyRawMissing
        ? []
        : parseWamiPillarMonthlyTracking(raw.tracking, locale),
      dailyRawMissing,
      monthlyRawMissing,
    };
  }, [selectedPillar, selectedWalletAddress, indexWami, locale, pillarLabels]);

  const blockLabels = useMemo(
    (): Record<PillarSummaryBlockId, string> => ({
      basic: copy.pillarBlockBasic,
      intermediate: copy.pillarBlockIntermediate,
      advanced: copy.pillarBlockAdvanced,
    }),
    [copy],
  );

  const pillarSummaryRaw = useMemo(() => {
    if (!selectedPillar || !selectedWalletAddress) return null;
    return getWalletPillarSummaryRawForPillar(indexWami, selectedPillar, selectedWalletAddress);
  }, [selectedPillar, selectedWalletAddress, indexWami]);

  const pillarSummaryData = useMemo(() => {
    if (!selectedPillar) {
      return {
        selectedPillarId: null as WamiPillarId | null,
        pillarLabel: null as string | null,
        summaryPoints: [] as ReturnType<typeof buildPillarSummaryChartPoints>,
        summaryMissing: false,
      };
    }
    const raw = pillarSummaryRaw;
    const summaryMissing = isPillarSummaryMissing(raw);
    const blocks = summaryMissing ? null : parsePillarSummary(raw);
    const summaryParseFailed = !summaryMissing && blocks === null;
    return {
      selectedPillarId: selectedPillar,
      pillarLabel: pillarLabels[selectedPillar],
      summaryPoints: blocks ? buildPillarSummaryChartPoints(blocks, blockLabels) : [],
      summaryMissing: summaryMissing || summaryParseFailed,
    };
  }, [selectedPillar, pillarSummaryRaw, pillarLabels, blockLabels]);

  useEffect(() => {
    if (!selectedPillar || !pillarSummaryRaw) return;
    if (selectedBlock && hasPillarSummaryItemsForBlock(pillarSummaryRaw, selectedBlock)) return;
    setSelectedBlock(resolveDefaultPillarSummaryBlockId(pillarSummaryRaw));
  }, [selectedPillar, selectedBlock, pillarSummaryRaw]);

  const blockDetailRows = useMemo(() => {
    if (!selectedPillar || !selectedBlock || !pillarSummaryRaw) return [];
    const items = getPillarSummaryItemsByBlock(pillarSummaryRaw, selectedBlock);
    return buildWamiBlockDetailsRows(items, selectedPillar, selectedBlock, lang, copy);
  }, [selectedPillar, selectedBlock, pillarSummaryRaw, lang, copy]);

  const blockTotalScore = useMemo(() => {
    if (!selectedBlock || !pillarSummaryRaw) return null;
    return getPillarSummaryBlockScore(pillarSummaryRaw, selectedBlock);
  }, [selectedBlock, pillarSummaryRaw]);

  const blockMaxScore = useMemo(() => {
    if (!selectedBlock) return null;
    return getPillarSummaryBlockMax(selectedBlock);
  }, [selectedBlock]);

  const selectedPillarScore = useMemo(() => {
    if (!selectedPillar) return null;
    const point = walletPillarPoints.find((p) => p.id === selectedPillar);
    return point?.value ?? null;
  }, [selectedPillar, walletPillarPoints]);

  const selectedPillarColor = useMemo(
    () => getPillarScoreBandColor(selectedPillarScore),
    [selectedPillarScore],
  );

  const selectedBlockColor = useMemo(() => {
    if (blockTotalScore === null || blockMaxScore === null) return HUMI_BAND_NEUTRAL;
    return getBlockPercentBandColor(blockTotalScore, blockMaxScore);
  }, [blockTotalScore, blockMaxScore]);

  const pillarExecutiveSummaryLabels = useMemo(
    (): Record<PillarExecutiveSummaryKey, string> => ({
      key_strengths: t.agentWamiPillarDetailsKeyStrengths,
      main_concerns: t.agentWamiPillarDetailsMainConcerns,
      recommendation: t.agentWamiPillarDetailsRecommendation,
      overall_assessment: t.agentWamiPillarDetailsOverallAssessment,
      business_interpretation: t.agentWamiPillarDetailsBusinessInterpretation,
    }),
    [
      t.agentWamiPillarDetailsKeyStrengths,
      t.agentWamiPillarDetailsMainConcerns,
      t.agentWamiPillarDetailsRecommendation,
      t.agentWamiPillarDetailsOverallAssessment,
      t.agentWamiPillarDetailsBusinessInterpretation,
    ],
  );

  const pillarDetailsSummaryMissing = useMemo(() => {
    if (!selectedPillar || !pillarSummaryRaw) return true;
    return !hasPillarExecutiveSummary(pillarSummaryRaw);
  }, [selectedPillar, pillarSummaryRaw]);

  const pillarDetailsRows = useMemo(() => {
    if (!selectedPillar || !pillarSummaryRaw) return [];
    return parsePillarExecutiveSummaryRows(
      pillarSummaryRaw,
      lang,
      pillarExecutiveSummaryLabels,
      copy.pillarDetailsEmpty,
    );
  }, [selectedPillar, pillarSummaryRaw, lang, pillarExecutiveSummaryLabels, copy.pillarDetailsEmpty]);

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  if (!agentId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <p className={cn('text-sm', muted)}>{t.agentWamiMissingAgentId}</p>
        <Link
          href="/dashboard/agents"
          className={cn(
            'inline-flex items-center justify-center rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors',
            isDark
              ? 'border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-100'
              : 'border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900',
          )}
        >
          {t.agentWamiGoToDirectory}
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

  const withPublicLang = (href: string) =>
    routeScope === 'public' ? appendPublicLangParam(href, lang) : href;

  return (
    <div className={cn('min-h-full', isDark ? 'text-zinc-100' : 'text-zinc-900')}>
      <div className="mx-auto max-w-7xl space-y-6 px-6 pt-8">
        {routeScope === 'public' ? (
          <Link
            href={withPublicLang(TOP10_AGENTS_LIST_PATH)}
            className="inline-flex text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            ← {lang === 'es' ? 'Top 10 agentes' : 'Top 10 agents'}
          </Link>
        ) : null}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            accentHex={wamiColor}
            className="min-w-0 w-full flex-1"
            contentClassName="p-4"
          >
            <AgentWamiAgentSummaryCard
              onChainId={agent.on_chain_id}
              agentName={title || agentId}
              calculatedAt={indexWami?.wami_score_calculated_at}
              calculatedAtLabel={t.agentWamiCalculatedAt}
              formatDate={formatDate}
              score={wamiDisplayScore}
              filterTier={wamiTier}
              filterLabel={wamiText}
              accentColor={wamiColor}
              points={agentPillarPoints}
              isDark={isDark}
              locale={locale}
              t={t}
            />
          </AgentDetailCard>

          <Link
            href={withPublicLang(agentDetailPagePath(agentId, lookupBy, routeScope))}
            className={cn(backLinkClass, 'self-start shrink-0')}
          >
            {t.agentWamiBackToOverview}
          </Link>
        </div>

        {copyToast ? (
          <p className={cn('text-center text-xs', muted)}>{t.agentWamiWalletCarouselCopied}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-stretch">
          <div className="flex flex-col gap-4 lg:min-h-0">
            <AgentDetailCard
              isDark={isDark}
              variant="metadata"
              accentHex={walletAccentColor}
              className="w-full"
              contentClassName="p-6"
            >
              <AgentWamiWalletAnalysisCard
                title={t.agentWamiWalletAnalysisTitle}
                rows={walletCarouselRows}
                selectedIndex={selectedWalletIndex}
                onIndexChange={handleCarouselIndexChange}
                isDark={isDark}
                lang={lang === 'es' ? 'es' : 'en'}
                t={t}
                onCopy={handleCopyWallet}
              />
            </AgentDetailCard>

            <AgentDetailCard
              isDark={isDark}
              variant="metadata"
              accentHex={selectedPillarColor || walletAccentColor}
              className="w-full"
              contentClassName="p-6"
            >
              <AgentWamiWalletPillarScoresCard
                points={walletPillarPoints}
                selectedPillarId={selectedPillar}
                onPillarSelect={handlePillarSelect}
                walletSubtitle={walletSubtitle}
                isDark={isDark}
                locale={locale}
                t={t}
              />
            </AgentDetailCard>

            <AgentDetailCard
              isDark={isDark}
              variant="metadata"
              accentHex={selectedBlockColor}
              className="w-full"
              contentClassName="p-6"
            >
              <AgentHumiPillarSummaryCard
                selectedPillarId={pillarSummaryData.selectedPillarId}
                selectedBlockId={selectedBlock}
                onBlockSelect={handleBlockSelect}
                pillarLabel={pillarSummaryData.pillarLabel}
                summaryPoints={pillarSummaryData.summaryPoints}
                summaryMissing={pillarSummaryData.summaryMissing}
                isDark={isDark}
                locale={locale}
                copy={copy}
                subtitleExtra={walletSubtitle}
              />
            </AgentDetailCard>
          </div>

          <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
            <AgentDetailCard
              isDark={isDark}
              variant="transactional"
              accentHex={wamiColor}
              className="w-full min-w-0 shrink-0"
              contentClassName="p-8"
            >
              <AgentHumiTrendCard
                dailySeries={dailyIndexSeries}
                monthlySeries={monthlyIndexSeries}
                accentColor={wamiColor}
                selectedPillarId={pillarTrendData.selectedPillarId}
                pillarLabel={pillarTrendData.pillarLabel}
                pillarDailySeries={pillarTrendData.dailySeries}
                pillarMonthlySeries={pillarTrendData.monthlySeries}
                pillarDailyRawMissing={pillarTrendData.dailyRawMissing}
                pillarMonthlyRawMissing={pillarTrendData.monthlyRawMissing}
                pillarAccentColor={selectedPillarColor}
                isDark={isDark}
                locale={locale}
                copy={copy}
                subtitleExtra={walletSubtitle}
              />
            </AgentDetailCard>

            <AgentDetailCard
              isDark={isDark}
              variant="transactional"
              accentHex={selectedPillarColor}
              className="flex w-full min-w-0 flex-col lg:min-h-0 lg:flex-1"
              contentClassName="flex min-h-0 flex-1 flex-col p-8"
            >
              <AgentHumiPillarDetailsCard
                selectedPillarId={selectedPillar}
                pillarLabel={selectedPillar ? pillarLabels[selectedPillar] : null}
                rows={pillarDetailsRows}
                summaryMissing={pillarDetailsSummaryMissing}
                isDark={isDark}
                copy={copy}
                subtitleExtra={walletSubtitle}
              />
            </AgentDetailCard>
          </div>
        </div>

        <AgentDetailCard
          isDark={isDark}
          variant="metadata"
          accentHex={selectedBlockColor}
          className="w-full"
          contentClassName="p-6"
        >
          <AgentHumiBlockDetailsCard
            selectedPillarId={selectedPillar}
            selectedBlockId={selectedBlock}
            pillarLabel={selectedPillar ? pillarLabels[selectedPillar] : null}
            blockLabel={selectedBlock ? blockLabels[selectedBlock] : null}
            rows={blockDetailRows}
            blockTotalScore={blockTotalScore}
            blockMaxScore={blockMaxScore}
            blockScoreColor={selectedBlockColor}
            isDark={isDark}
            locale={locale}
            notAvailableLabel={t.notAvailable}
            copy={copy}
            subtitleExtra={walletSubtitle}
          />
        </AgentDetailCard>
      </div>
    </div>
  );
}
