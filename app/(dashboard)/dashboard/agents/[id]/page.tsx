'use client';

import Image from 'next/image';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { ChartLabelResolver } from '@/lib/agentDeltaSeries';
import {
  buildBalanceDeltaSeries,
  buildNonceDeltaSeries,
} from '@/lib/agentDeltaSeries';
import { getHumiScoreColor, getHumiScoreText } from '@/lib/agentHumiDisplay';
import { normalizeChainName } from '@/lib/agentChains';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';
import { formatDashboardDateUtc } from '@/lib/formatDashboardDate';
import { cn } from '@/lib/utils';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { AgentDetailWarningsCard } from '@/components/dashboard/AgentDetailWarningsCard';
import { AgentDetailIndexScoreCard } from '@/components/dashboard/AgentDetailIndexScoreCard';
import { MetadataRichnessLayersChart } from '@/components/dashboard/MetadataRichnessLayersChart';
import { AgentTransactionalChart } from '@/components/dashboard/AgentTransactionalChart';
import { metadataRichnessTier, parseMetadataRichnessInformation } from '@/lib/metadataRichness';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import { parseAgentWarnings } from '@/lib/agentWarnings';
import { parseOwnerWalletDetails } from '@/lib/agentOwnerWalletDetails';
import { parseTransactionalWallets } from '@/lib/agentTransactionalWallets';
import { AgentTransactionalWalletCarousel } from '@/components/dashboard/AgentTransactionalWalletCarousel';
import { AgentDetailOnChainCard } from '@/components/dashboard/AgentDetailOnChainCard';
import { AgentDetailOwnerCard } from '@/components/dashboard/AgentDetailOwnerCard';
import {
  AgentFeedbackAccordion,
  type AgentFeedbackRow,
} from '@/components/dashboard/AgentFeedbackAccordion';
import { useAgentRecentNavigation } from '../../components/AgentRecentNavigationContext';
import { useDashboardTitleOverride } from '../../components/DashboardTitleOverrideContext';
import { useLanguage } from '../../components/LanguageContext';
import type { Translations } from '../../components/LanguageContext';

const AGENT_IMAGE_DEFAULT = '/agent_details_default.png';
const AGENT_IMAGE_NOT_LOADED = '/agent_directory_not_loaded.png';
const DESC_PREVIEW_CHARS = 220;

type AgentDetailRow = Record<string, unknown>;

function agentHasImageUrl(imageUrl: unknown): boolean {
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0;
}

function jsonFieldEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v as object).length === 0;
  if (typeof v === 'string') return !v.trim();
  return false;
}

function stripNumericBalance(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = String(v).trim();
  s = s.replace(/\s*ETH\s*$/i, '').trim();
  return s;
}

function profileLabelsFromJson(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return [];
  return Object.keys(raw as object);
}

function formatProfileBadgeLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

type MetaRow = {
  field: string;
  labelKey: keyof Translations;
};
const METADATA_ROWS: MetaRow[] = [
  { field: 'skills', labelKey: 'metadataTabSkills' },
  { field: 'supported_trust', labelKey: 'metadataTabSupportedTrust' },
  { field: 'capabilites', labelKey: 'metadataTabCapabilities' },
  { field: 'tags', labelKey: 'metadataTabTags' },
  { field: 'oasf_skills', labelKey: 'metadataTabOasfSkills' },
  { field: 'oasf_domains', labelKey: 'metadataTabOasfDomains' },
  { field: 'technical_tools', labelKey: 'metadataTabTechnicalTools' },
  { field: 'technical_prompts', labelKey: 'metadataTabTechnicalPrompts' },
  { field: 'technical_capabilities', labelKey: 'metadataTabTechnicalCapabilities' },
  { field: 'services', labelKey: 'metadataTabServices' },
];

const FEEDBACK_ROWS: AgentFeedbackRow[] = [
  { summaryField: 'comments_summary', hasField: 'has_comments', labelKey: 'feedbackTabComments' },
  { summaryField: 'attestations_summary', hasField: 'has_attestations', labelKey: 'feedbackTabAttestations' },
  { summaryField: 'external_audit_summary', hasField: 'has_external_audit', labelKey: 'feedbackTabExternalAudit' },
  {
    summaryField: 'identity_analysis_summary',
    hasField: 'has_identity_analysis',
    labelKey: 'feedbackTabIdentityAnalysis',
  },
  {
    summaryField: 'on_chain_execution_summary',
    hasField: 'has_on_chain_executions',
    labelKey: 'feedbackTabOnChainExecutions',
  },
  {
    summaryField: 'on_chain_feedback_summary',
    hasField: 'has_on_chain_feedbacks',
    labelKey: 'feedbackTabOnChainFeedbacks',
  },
  {
    summaryField: 'protocol_activity_summary',
    hasField: 'has_protocol_activity',
    labelKey: 'feedbackTabProtocolActivity',
  },
];

export default function AgentDetailPage() {
  const params = useParams();
  const routeId =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { recordAgentVisit } = useAgentRecentNavigation();
  const { t, lang, theme } = useLanguage();
  const { setTitleOverride } = useDashboardTitleOverride();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentDetailRow | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [chainLogoFailed, setChainLogoFailed] = useState(false);

  const [descModalOpen, setDescModalOpen] = useState(false);
  const [transactionalSeries, setTransactionalSeries] = useState<'nonce' | 'balance'>('nonce');

  const [activeMetaField, setActiveMetaField] = useState<string | null>(null);
  const [activeFeedbackSummary, setActiveFeedbackSummary] = useState<string | null>(null);
  const [metadataView, setMetadataView] = useState<'analysis' | 'data'>('analysis');
  const chartLabelOf: ChartLabelResolver = useCallback(
    (bucket) => {
      const map: Record<string, keyof Translations> = {
        today: 'chartLabelToday',
        '7d': 'chartLabel7d',
        '15d': 'chartLabel15d',
        '1m': 'chartLabel1m',
        '2m': 'chartLabel2m',
        '3m': 'chartLabel3m',
        '6m': 'chartLabel6m',
        '9m': 'chartLabel9m',
        '12m': 'chartLabel12m',
      };
      return t[map[bucket]] as string;
    },
    [t]
  );

  useEffect(() => {
    if (!routeId) {
      setLoading(false);
      setError(t.agentDetailLoadError);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setAgent(null);

    (async () => {
      try {
        const res = await fetch(`/api/dashboard/agents/${encodeURIComponent(routeId)}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !body?.data) {
          setError(t.agentDetailLoadError);
          setAgent(null);
          return;
        }
        setAgent(body.data as AgentDetailRow);
      } catch {
        if (!cancelled) {
          setError(t.agentDetailLoadError);
          setAgent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeId, t.agentDetailLoadError]);

  useEffect(() => {
    setImgFailed(false);
  }, [agent?.image_url]);

  useEffect(() => {
    if (!agent) return;
    recordAgentVisit(String(routeId), String(agent.name ?? routeId));
  }, [agent, recordAgentVisit, routeId]);

  useEffect(() => {
    if (!agent) {
      setTitleOverride(null);
      return;
    }

    const name =
      typeof agent?.name === 'string' && agent.name.trim().length > 0
        ? agent.name
        : routeId;

    setTitleOverride(`${name} (${t.agentOverviewTitle})`);

    return () => setTitleOverride(null);
  }, [agent, routeId, t.agentOverviewTitle, setTitleOverride]);

  useEffect(() => {
    if (!agent) {
      setActiveMetaField(null);
      return;
    }
    const first = METADATA_ROWS.find((row) => !jsonFieldEmpty(agent[row.field]));
    setActiveMetaField(first?.field ?? null);
  }, [agent]);

  useEffect(() => {
    if (!agent) {
      setActiveFeedbackSummary(null);
      return;
    }
    const first = FEEDBACK_ROWS.find(
      (row) =>
        agent[row.hasField] === true && !jsonFieldEmpty(agent[row.summaryField])
    );
    setActiveFeedbackSummary(first?.summaryField ?? null);
  }, [agent]);

  const chainLogoSrc = useMemo(
    () => publicChainLogoUrl(agent?.chain_logo_file_name as string | null | undefined),
    [agent?.chain_logo_file_name]
  );

  useEffect(() => {
    setChainLogoFailed(false);
  }, [chainLogoSrc]);

  const formatDate = (dateString: string | null | undefined) =>
    formatDashboardDateUtc(dateString, lang === 'es' ? 'es-ES' : 'en-US', t.notAvailable);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.agentDetailCopied);
  };

  const description = typeof agent?.description === 'string' ? agent.description : '';
  const showReadMore = description.length > DESC_PREVIEW_CHARS;

  const humiFilter = typeof agent?.humi_score_filter === 'string' ? agent.humi_score_filter : '';
  const humiColor = getHumiScoreColor(humiFilter);
  const humiText = getHumiScoreText(humiFilter, t);

  const wamiFilter = typeof agent?.wami_score_filter === 'string' ? agent.wami_score_filter : '';
  const wamiColor = getHumiScoreColor(wamiFilter);
  const wamiText = getHumiScoreText(wamiFilter, t);

  const humiScoreRaw = agent?.current_humi_score;
  const humiScore =
    humiScoreRaw !== null && humiScoreRaw !== undefined && Number.isFinite(Number(humiScoreRaw))
      ? Number(humiScoreRaw)
      : null;

  const wamiScoreRaw = agent?.current_wami_score;
  const wamiScore =
    wamiScoreRaw !== null && wamiScoreRaw !== undefined && Number.isFinite(Number(wamiScoreRaw))
      ? Number(wamiScoreRaw)
      : null;

  const agentWarnings = useMemo(
    () => parseAgentWarnings(agent?.agent_warnings),
    [agent?.agent_warnings],
  );

  const ownerWalletActivity = useMemo(
    () => parseOwnerWalletDetails(agent?.owner_wallet_details),
    [agent?.owner_wallet_details],
  );

  const transactionalWallets = useMemo(
    () =>
      parseTransactionalWallets(
        agent?.wallet_wami_score_details,
        agent?.wallet_category,
      ),
    [agent?.wallet_wami_score_details, agent?.wallet_category],
  );

  const nonceChartData = useMemo(() => {
    if (!agent) return [];
    const cur =
      agent.nonce_current !== null && agent.nonce_current !== undefined
        ? Number(agent.nonce_current)
        : null;
    return buildNonceDeltaSeries(agent.nonce_history, cur, chartLabelOf);
  }, [agent, chartLabelOf]);

  const balanceChartData = useMemo(() => {
    if (!agent) return [];
    const raw = agent.balance_current;
    let cur: number | null = null;
    if (raw !== null && raw !== undefined) {
      const n = Number(stripNumericBalance(raw));
      if (Number.isFinite(n)) cur = n;
    }
    return buildBalanceDeltaSeries(agent.balance_history, cur, chartLabelOf);
  }, [agent, chartLabelOf]);

  const transactionalChartData =
    transactionalSeries === 'nonce' ? nonceChartData : balanceChartData;

  const richnessParsed = useMemo(
    () => parseMetadataRichnessInformation(agent?.metadata_richness_information),
    [agent?.metadata_richness_information]
  );

  const metadataRichnessDisplayScore = useMemo(() => {
    if (!agent) return null;
    const v = agent.metadata_richness_score;
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return richnessParsed?.totalScore ?? null;
  }, [agent, richnessParsed]);

  const richnessTier = useMemo(
    () => metadataRichnessTier(metadataRichnessDisplayScore),
    [metadataRichnessDisplayScore]
  );

  const normalizedChainDisplay = normalizeChainName(
    typeof agent?.chain_name === 'string' ? agent.chain_name : ''
  );

  if (loading) {
    return (
      <div
        className={`flex min-h-[50vh] items-center justify-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
      >
        <p>{t.agentDetailLoading}</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div
        className={`flex min-h-[50vh] flex-col items-center justify-center px-6 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
      >
        <p className="max-w-lg text-lg">{t.agentDetailLoadError}</p>
      </div>
    );
  }

  const imageSrc = !agentHasImageUrl(agent.image_url)
    ? AGENT_IMAGE_DEFAULT
    : imgFailed
      ? AGENT_IMAGE_NOT_LOADED
      : (agent.image_url as string).trim();

  const webHref =
    typeof agent.web === 'string' && agent.web.trim().length > 0
      ? agent.web.trim().startsWith('http')
        ? agent.web.trim()
        : `https://${agent.web.trim()}`
      : '';

  const emailHref = (() => {
    if (typeof agent.email !== 'string' || !agent.email.trim()) return '';
    const e = agent.email.trim();
    if (e.startsWith('mailto:')) return e;
    if (e.includes('@')) return `mailto:${e}`;
    return e;
  })();

  const profileKeys = profileLabelsFromJson(agent.profiles);

  const metaJson =
    activeMetaField && !jsonFieldEmpty(agent[activeMetaField])
      ? JSON.stringify(agent[activeMetaField], null, 2)
      : null;

  const cardInlay = isDark
    ? 'rounded-2xl border border-zinc-700/55 bg-zinc-950/75 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] backdrop-blur-[1px]'
    : 'rounded-2xl border border-zinc-300/70 bg-white/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]';
  const muted = isDark ? 'text-gray-400' : 'text-zinc-600';
  const prose = isDark ? 'text-gray-300' : 'text-zinc-800';
  const tabActive = isDark ? 'bg-white text-black font-medium' : 'bg-zinc-900 text-white font-medium';
  const tabIdle = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300';
  const tabDisabled = isDark
    ? 'cursor-not-allowed bg-gray-900 text-gray-600 border border-gray-800'
    : 'cursor-not-allowed bg-zinc-100 text-zinc-400 border border-zinc-200';

  return (
    <div
      className={`min-h-full pb-20 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}
    >
      {descModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/40'}`}
          role="presentation"
          onClick={() => setDescModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="desc-modal-title"
            className={`max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl ${
              isDark ? 'border border-zinc-700 bg-zinc-900' : 'border border-zinc-200 bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="desc-modal-title"
                className={`text-xl font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
              >
                {t.descriptionModalTitle}
              </h2>
              <button
                type="button"
                className={`rounded-xl border px-4 py-2 text-sm ${
                  isDark
                    ? 'border-zinc-600 hover:bg-white/10'
                    : 'border-zinc-300 hover:bg-zinc-100'
                }`}
                onClick={() => setDescModalOpen(false)}
              >
                {t.closeModal}
              </button>
            </div>
            <p className={`whitespace-pre-wrap leading-relaxed ${isDark ? 'text-gray-200' : 'text-zinc-800'}`}>
              {description}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex w-80 max-w-full flex-shrink-0 flex-col gap-4 mx-auto lg:mx-0">
            <AgentDetailCard
              isDark={isDark}
              variant="image"
              className="w-full"
              contentClassName="relative h-80 w-full overflow-hidden rounded-3xl"
            >
              <div className="relative h-full w-full p-3">
                <Image
                  src={imageSrc}
                  alt={String(agent.name ?? 'Agent')}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 320px"
                  unoptimized
                  onError={() => setImgFailed(true)}
                />
              </div>
            </AgentDetailCard>
            <AgentDetailCard isDark={isDark} variant="profiles" className="w-full" contentClassName="p-4">
              <h3
                className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-zinc-500'}`}
              >
                {t.agentDetailProfilesCardTitle}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profileKeys.map((pk) => (
                  <span
                    key={pk}
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      isDark
                        ? 'border-gray-600 bg-white/10 text-gray-200'
                        : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {formatProfileBadgeLabel(pk)}
                  </span>
                ))}
              </div>
            </AgentDetailCard>
            {webHref || emailHref ? (
              <div className="flex w-full flex-wrap gap-3">
                {webHref ? (
                  <a
                    href={webHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex flex-1 min-w-[8rem] items-center justify-center gap-1.5 rounded-2xl px-6 py-3 text-sm transition-colors ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'border border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <ExternalLink size={14} className="shrink-0 opacity-80" />
                    {t.agentDetailWeb}
                  </a>
                ) : null}
                {emailHref ? (
                  <a
                    href={emailHref}
                    className={`inline-flex flex-1 min-w-[8rem] items-center justify-center gap-1.5 rounded-2xl px-6 py-3 text-sm transition-colors ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'border border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <Mail size={14} className="shrink-0 opacity-80" />
                    {t.agentDetailEmail}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex-1 pt-4 min-w-0">
            <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_min(20rem,32%)] xl:items-start xl:gap-6">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {String(agent.name ?? '')}
                  </h1>
                  {agent.on_chain_id ? (
                    <span
                      className={`max-w-full truncate rounded-full border px-3 py-1 font-mono text-xs ${
                        isDark ? 'border-gray-600 bg-white/5 text-gray-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {String(agent.on_chain_id)}
                    </span>
                  ) : null}
                </div>

                {description ? (
                  <div className="mt-6 max-w-3xl">
                    <p className={`text-xl leading-relaxed ${prose}`}>
                      {showReadMore ? `${description.slice(0, DESC_PREVIEW_CHARS)}…` : description}
                    </p>
                    {showReadMore ? (
                      <button
                        type="button"
                        className="mt-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                        onClick={() => setDescModalOpen(true)}
                      >
                        {t.readMoreDescription}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className={`mt-6 text-xl ${isDark ? 'text-gray-500' : 'text-zinc-500'}`}>{t.noDescription}</p>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AgentDetailIndexScoreCard
                    cardTitle={t.agentDetailIndexHumiTitle}
                    cardHelpText={t.agentDetailIndexHumiHelp}
                    score={humiScore}
                    filterTier={humiFilter}
                    filterLabel={humiText}
                    accentColor={humiColor}
                    detailsHref={`/dashboard/agents/${encodeURIComponent(routeId)}/humi`}
                    plusAriaLabel={t.agentDetailIndexPlusAriaLabelHumi}
                    infoAriaLabel={t.agentDetailIndexInfoAriaLabel}
                    notAvailableLabel={t.notAvailable}
                    isDark={isDark}
                  />
                  <AgentDetailIndexScoreCard
                    cardTitle={t.agentDetailIndexWamiTitle}
                    cardHelpText={t.agentDetailIndexWamiHelp}
                    score={wamiScore}
                    filterTier={wamiFilter}
                    filterLabel={wamiText}
                    accentColor={wamiColor}
                    plusAriaLabel={t.agentDetailIndexPlusAriaLabelWami}
                    infoAriaLabel={t.agentDetailIndexInfoAriaLabel}
                    notAvailableLabel={t.notAvailable}
                    isDark={isDark}
                  />
                </div>
              </div>

              <AgentDetailWarningsCard
                warnings={agentWarnings}
                isDark={isDark}
                t={t}
                className="w-full xl:sticky xl:top-8"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-stretch">
          <div className="flex h-full flex-col gap-4 self-stretch xl:col-span-5">
            <AgentDetailOnChainCard
              isDark={isDark}
              t={t}
              chainLogoSrc={chainLogoSrc}
              chainLogoFailed={chainLogoFailed}
              onChainLogoError={() => setChainLogoFailed(true)}
              chainDisplayName={normalizedChainDisplay}
              walletChainRegister={
                typeof agent.wallet_chain_register === 'string'
                  ? agent.wallet_chain_register
                  : null
              }
              onChainCreatedAt={
                typeof agent.on_chain_created_at === 'string'
                  ? agent.on_chain_created_at
                  : null
              }
              ownerChanges={agent.owner_changes}
              formatDate={formatDate}
              onCopy={copyToClipboard}
              mutedClassName={muted}
            />
            <AgentDetailOwnerCard
              isDark={isDark}
              t={t}
              governanceType={
                agent.gobernance_type != null ? String(agent.gobernance_type) : null
              }
              ownerWallet={
                typeof agent.owner_wallet === 'string' ? agent.owner_wallet : null
              }
              ownerSinceAt={
                typeof agent.owner_since_at === 'string' ? agent.owner_since_at : null
              }
              activityRows={ownerWalletActivity}
              activityResetKey={routeId}
              formatDate={formatDate}
              onCopy={copyToClipboard}
              mutedClassName={muted}
            />
          </div>

          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            className="flex h-full min-h-0 flex-col xl:col-span-7"
            contentClassName="flex min-h-0 flex-1 flex-col p-8"
          >
            <div className="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">{t.agentDetailMetadataInformation}</h2>
                <button
                  type="button"
                  onClick={() => setMetadataView('analysis')}
                  className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                    metadataView === 'analysis' ? tabActive : tabIdle
                  }`}
                >
                  {t.agentDetailMetadataViewAnalysis}
                </button>
                <button
                  type="button"
                  onClick={() => setMetadataView('data')}
                  className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                    metadataView === 'data' ? tabActive : tabIdle
                  }`}
                >
                  {t.agentDetailMetadataViewData}
                </button>
              </div>
              <div
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                  agent.has_x402 === true
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-emerald-100 text-emerald-800'
                    : isDark
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-red-50 text-red-600'
                }`}
              >
                {agent.has_x402 === true ? t.metadataX402Enabled : t.metadataX402Disabled}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
            {metadataView === 'analysis' ? (
              <div
                className={
                  richnessParsed
                    ? 'flex min-h-0 flex-1 flex-col gap-6'
                    : 'space-y-8'
                }
              >
                {metadataRichnessDisplayScore === null && richnessParsed === null ? (
                  <p className={`text-sm ${muted}`}>{t.agentDetailMetadataRichnessEmpty}</p>
                ) : (
                  <>
                    <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold ${muted}`}>
                            {t.agentDetailRichnessScoreLabel}
                          </span>
                          <DashboardInfoTooltip
                            content={t.agentDetailRichnessScoreHelp}
                            ariaLabel={t.agentDetailRichnessScoreInfoAriaLabel}
                            isDark={isDark}
                            placement="top"
                            tooltipClassName="max-w-[18rem] whitespace-normal normal-case"
                          />
                        </div>
                        {metadataRichnessDisplayScore !== null ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span
                                className="text-5xl font-bold leading-none tabular-nums"
                                style={{
                                  color:
                                    richnessTier?.colorHex ?? (isDark ? '#fafafa' : '#18181b'),
                                }}
                              >
                                {metadataRichnessDisplayScore.toLocaleString(
                                  lang === 'es' ? 'es-ES' : 'en-US',
                                  { maximumFractionDigits: 2 },
                                )}
                              </span>
                              <span className={`text-2xl font-semibold leading-none ${muted}`}>
                                /100
                              </span>
                            </div>
                            {richnessTier ? (
                              <span
                                className="mt-1 inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold"
                                style={{
                                  backgroundColor: `${richnessTier.colorHex}22`,
                                  color: richnessTier.colorHex,
                                  border: `1px solid ${richnessTier.colorHex}66`,
                                }}
                              >
                                {t[richnessTier.labelKey]}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span className={`text-sm ${muted}`}>{t.notAvailable}</span>
                        )}
                      </div>
                      {richnessParsed?.calculatedAt ? (
                        <div className={`shrink-0 text-sm lg:text-right ${muted}`}>
                          <span>{t.agentDetailMetadataRichnessCalculatedAt}: </span>
                          <span className="tabular-nums">{formatDate(richnessParsed.calculatedAt)}</span>
                        </div>
                      ) : null}
                    </div>

                    {richnessParsed ? (
                      <div
                        className={`flex min-h-[200px] flex-1 flex-col p-6 ${cardInlay}`}
                      >
                        <MetadataRichnessLayersChart
                          parsed={richnessParsed}
                          isDark={isDark}
                          t={t}
                          lang={lang}
                          resetKey={routeId}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`mb-6 flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-gray-800' : 'border-zinc-200'}`}
                >
                  {METADATA_ROWS.map((row) => {
                    const empty = jsonFieldEmpty(agent[row.field]);
                    return (
                      <button
                        key={row.field}
                        type="button"
                        disabled={empty}
                        onClick={() => !empty && setActiveMetaField(row.field)}
                        className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                          empty
                            ? tabDisabled
                            : activeMetaField === row.field
                              ? tabActive
                              : tabIdle
                        }`}
                      >
                        {t[row.labelKey]}
                      </button>
                    );
                  })}
                </div>

                <div className={`max-h-[520px] overflow-auto p-6 ${cardInlay}`}>
                  <pre
                    className={`whitespace-pre-wrap font-mono text-sm ${isDark ? 'text-gray-300' : 'text-zinc-800'}`}
                  >
                    {metaJson ?? t.agentDetailNoJsonToShow}
                  </pre>
                </div>
              </>
            )}
            </div>
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="transactional"
            className="xl:col-span-7"
            contentClassName="p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">
              {t.agentDetailTransactionalWalletTitle}
            </h2>

            <AgentTransactionalWalletCarousel
              rows={transactionalWallets}
              isDark={isDark}
              lang={lang === 'es' ? 'es' : 'en'}
              t={t}
              resetKey={routeId}
              onCopy={copyToClipboard}
            />

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <button
                type="button"
                onClick={() => setTransactionalSeries('nonce')}
                className={cn(
                  'flex min-h-[7.5rem] min-w-0 flex-col rounded-2xl border p-4 transition-all',
                  isDark ? 'border-zinc-700/55' : 'border-zinc-200/80',
                  transactionalSeries === 'nonce' ? tabActive : tabIdle,
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={`text-left text-sm ${transactionalSeries === 'nonce' ? '' : muted}`}
                  >
                    {t.transactionalNonceCurrentLabel}
                  </span>
                  <span
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <DashboardInfoTooltip
                      content={t.transactionalNonceCurrentHelp}
                      ariaLabel={t.transactionalNonceInfoAriaLabel}
                      isDark={isDark}
                      placement="top"
                      tooltipClassName="max-w-[16rem] whitespace-normal normal-case"
                    />
                  </span>
                </div>
                <div className="flex min-h-[4.5rem] flex-1 items-center justify-center">
                  <span className="text-center text-5xl font-bold tabular-nums">
                    {agent.nonce_current !== null && agent.nonce_current !== undefined
                      ? String(agent.nonce_current)
                      : t.notAvailable}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTransactionalSeries('balance')}
                className={cn(
                  'flex min-h-[7.5rem] min-w-0 flex-col rounded-2xl border p-4 transition-all',
                  isDark ? 'border-zinc-700/55' : 'border-zinc-200/80',
                  transactionalSeries === 'balance' ? tabActive : tabIdle,
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={`text-left text-sm ${transactionalSeries === 'balance' ? '' : muted}`}
                  >
                    {t.transactionalBalanceCurrentLabel}
                  </span>
                  <span
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <DashboardInfoTooltip
                      content={t.transactionalBalanceCurrentHelp}
                      ariaLabel={t.transactionalBalanceInfoAriaLabel}
                      isDark={isDark}
                      placement="top"
                      tooltipClassName="max-w-[16rem] whitespace-normal normal-case"
                    />
                  </span>
                </div>
                <div className="flex min-h-[4.5rem] flex-1 items-center justify-center">
                  <span
                    className={cn(
                      'break-all text-center text-3xl font-bold tabular-nums sm:text-4xl',
                      transactionalSeries === 'balance'
                        ? ''
                        : isDark
                          ? 'text-emerald-400'
                          : 'text-emerald-600',
                    )}
                    title={
                      stripNumericBalance(agent.balance_current)
                        ? stripNumericBalance(agent.balance_current)
                        : undefined
                    }
                  >
                    {stripNumericBalance(agent.balance_current) || t.notAvailable}
                  </span>
                </div>
              </button>
            </div>

            <div className={`h-80 p-4 ${cardInlay}`}>
              <AgentTransactionalChart
                data={transactionalChartData}
                series={transactionalSeries}
                isDark={isDark}
                locale={lang === 'es' ? 'es-ES' : 'en-US'}
                emptyMessage={t.agentDetailNoJsonToShow}
                vsPreviousLabel={t.transactionalDeltaVsPrevious}
              />
            </div>
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="feedback"
            className="xl:col-span-5"
            contentClassName="p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailFeedbackData}</h2>

            <AgentFeedbackAccordion
              agent={agent}
              isDark={isDark}
              t={t}
              rows={FEEDBACK_ROWS}
              expandedField={activeFeedbackSummary}
              onExpandedChange={setActiveFeedbackSummary}
              jsonFieldEmpty={jsonFieldEmpty}
              panelClassName={cardInlay}
              formatDate={formatDate}
              resetKey={routeId}
            />
          </AgentDetailCard>
        </div>
      </div>
    </div>
  );
}
