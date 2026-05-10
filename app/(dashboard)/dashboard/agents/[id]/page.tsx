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
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { MetadataRichnessLayersChart } from '@/components/dashboard/MetadataRichnessLayersChart';
import { AgentFeedbackRadarChart } from '@/components/dashboard/AgentFeedbackRadarChart';
import { AgentTransactionalChart } from '@/components/dashboard/AgentTransactionalChart';
import {
  metadataRichnessTier,
  parseMetadataRichnessInformation,
  type RichnessSegmentHoverDetail,
} from '@/lib/metadataRichness';
import { parseAgentFeedbackAnalysis } from '@/lib/agentFeedbackAnalysis';
import { useAgentRecentNavigation } from '../../components/AgentRecentNavigationContext';
import { useLanguage } from '../../components/LanguageContext';
import type { Translations } from '../../components/LanguageContext';

const IMAGE_FALLBACK = '/agent_details_default.png';
const DESC_PREVIEW_CHARS = 220;

type AgentDetailRow = Record<string, unknown>;

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

type FeedbackRow = {
  summaryField: string;
  hasField: string;
  labelKey: keyof Translations;
};

const FEEDBACK_ROWS: FeedbackRow[] = [
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
  const [feedbackView, setFeedbackView] = useState<'analysis' | 'data'>('analysis');
  const [richnessHover, setRichnessHover] = useState<RichnessSegmentHoverDetail | null>(null);

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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t.notAvailable;
    const loc = lang === 'es' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(loc, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.agentDetailCopied);
  };

  const description = typeof agent?.description === 'string' ? agent.description : '';
  const showReadMore = description.length > DESC_PREVIEW_CHARS;

  const humiFilter = typeof agent?.humi_score_filter === 'string' ? agent.humi_score_filter : '';
  const humiColor = getHumiScoreColor(humiFilter);
  const humiText = getHumiScoreText(humiFilter, t);

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

  const feedbackParsed = useMemo(
    () => parseAgentFeedbackAnalysis(agent?.agent_feedback_analysis),
    [agent?.agent_feedback_analysis]
  );

  useEffect(() => {
    setRichnessHover(null);
  }, [metadataView, routeId]);

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

  const imageSrcPrimary =
    !imgFailed &&
    typeof agent.image_url === 'string' &&
    (agent.image_url as string).trim().length > 0
      ? (agent.image_url as string).trim()
      : IMAGE_FALLBACK;

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

  const feedbackJson =
    activeFeedbackSummary && !jsonFieldEmpty(agent[activeFeedbackSummary])
      ? JSON.stringify(agent[activeFeedbackSummary], null, 2)
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
                  src={imageSrcPrimary}
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
          </div>

          <div className="flex-1 pt-4 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
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
              <div className="flex flex-wrap gap-2 shrink-0 justify-end">
                {agent.is_dummy === true ? (
                  <span className="px-4 py-1.5 bg-amber-500/10 text-amber-300 text-sm font-medium rounded-full border border-amber-500/30">
                    {t.dummyLabel}
                  </span>
                ) : null}
                {agent.has_duplicate_agent === true ? (
                  <span className="px-4 py-1.5 bg-rose-500/10 text-rose-300 text-sm font-medium rounded-full border border-rose-500/30">
                    {t.duplicateLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-start gap-4">
              <div
                className={`shrink-0 text-7xl font-bold ${
                  agent.current_humi_score === null || agent.current_humi_score === undefined
                    ? 'text-gray-400'
                    : humiFilter
                      ? ''
                      : 'text-gray-300'
                }`}
                style={
                  humiFilter &&
                  agent.current_humi_score !== null &&
                  agent.current_humi_score !== undefined
                    ? { color: humiColor }
                    : undefined
                }
              >
                {agent.current_humi_score !== null && agent.current_humi_score !== undefined
                  ? `${agent.current_humi_score}★`
                  : t.notAvailable}
              </div>
              <div className="flex min-w-[10rem] flex-col gap-2 pt-1 sm:pt-2">
                <div className={`text-xl leading-tight sm:text-2xl ${muted}`}>
                  {t.agentDetailHumiScoreLabel}
                </div>
                <button
                  type="button"
                  className={`inline-flex w-full items-center justify-center rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:self-start ${
                    isDark
                      ? 'border-zinc-700 bg-white/5 hover:bg-white/10'
                      : 'border-zinc-300 bg-white hover:bg-zinc-50'
                  }`}
                >
                  {t.agentDetailViewDetails}
                </button>
              </div>
            </div>

            <div className="mt-3">
              {humiFilter ? (
                <span
                  className="inline-flex px-4 py-1.5 text-sm font-medium rounded-full border"
                  style={{
                    color: humiColor,
                    borderColor: `${humiColor}55`,
                    backgroundColor: `${humiColor}18`,
                  }}
                >
                  {humiText}
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

            <div className="flex gap-4 mt-8 flex-wrap">
              {webHref ? (
                <a
                  href={webHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-6 py-3 text-sm transition-colors ${
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
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-6 py-3 text-sm transition-colors ${
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
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <AgentDetailCard
            isDark={isDark}
            variant="onchain"
            className="xl:col-span-5"
            contentClassName="relative overflow-hidden p-8 pb-12"
          >
            {agent.gobernance_type ? (
              <div className="absolute right-6 top-6 z-10 max-w-[62%] text-right">
                <span
                  className={`inline-block max-w-full rounded-full border px-3 py-1 text-left text-xs font-medium leading-snug ${
                    isDark
                      ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                      : 'border-violet-300 bg-violet-50 text-violet-900'
                  }`}
                  title={`${t.governanceTypeLabel} ${String(agent.gobernance_type)}`}
                >
                  <span className="opacity-90">{t.governanceTypeLabel}</span>{' '}
                  <span className="break-words font-semibold">{String(agent.gobernance_type)}</span>
                </span>
              </div>
            ) : null}
            <h2
              className={`mb-6 text-2xl font-semibold ${agent.gobernance_type ? 'pr-32 sm:pr-44' : ''}`}
            >
              {t.agentDetailOnChainData}
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {chainLogoSrc && !chainLogoFailed ? (
                  <div
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border ${
                      isDark ? 'border-zinc-700 bg-black/40' : 'border-zinc-200 bg-white'
                    }`}
                  >
                    <Image
                      src={chainLogoSrc}
                      alt={normalizedChainDisplay}
                      fill
                      className="object-contain p-1"
                      unoptimized
                      onError={() => setChainLogoFailed(true)}
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl">
                    🔗
                  </div>
                )}
                <div>
                  <div className={`text-sm ${muted}`}>{t.agentDetailChainLabel}</div>
                  <div className="font-medium">{normalizedChainDisplay || t.notAvailable}</div>
                </div>
              </div>

              <div>
                <div className={`text-sm ${muted}`}>{t.agentDetailWalletOnChainIdInfo}</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {agent.wallet_chain_register ? String(agent.wallet_chain_register) : t.notAvailable}
                  {typeof agent.wallet_chain_register === 'string' &&
                  (agent.wallet_chain_register as string).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(agent.wallet_chain_register))}
                      className={`shrink-0 ${isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      <Copy size={16} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className={`text-sm ${muted}`}>{t.agentDetailCreatedAt}</div>
                  <div className="mt-1">
                    {typeof agent.on_chain_created_at === 'string'
                      ? formatDate(agent.on_chain_created_at as string)
                      : t.notAvailable}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${muted}`}>{t.agentDetailOwnerChanges}</div>
                  <div className="mt-1 font-medium">
                    {agent.owner_changes !== undefined && agent.owner_changes !== null
                      ? String(agent.owner_changes)
                      : t.notAvailable}
                  </div>
                </div>
              </div>

              <div>
                <div className={`text-sm ${muted}`}>{t.agentDetailOwnerWallet}</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {agent.owner_wallet ? String(agent.owner_wallet) : t.notAvailable}
                  {typeof agent.owner_wallet === 'string' && (agent.owner_wallet as string).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(agent.owner_wallet))}
                      className={`shrink-0 ${isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      <Copy size={16} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <div className={`text-sm ${muted}`}>{t.agentDetailOwnerSince}</div>
                <div className="mt-1">
                  {typeof agent.owner_since_at === 'string'
                    ? formatDate(agent.owner_since_at as string)
                    : t.notAvailable}
                </div>
              </div>
            </div>
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="metadata"
            className="xl:col-span-7"
            contentClassName="p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">{t.agentDetailMetadataInformation}</h2>
              <div
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
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

            <div
              className={`mb-6 flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-gray-800' : 'border-zinc-200'}`}
            >
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

            {metadataView === 'analysis' ? (
              <div className="space-y-8">
                {metadataRichnessDisplayScore === null && richnessParsed === null ? (
                  <p className={`text-sm ${muted}`}>{t.agentDetailMetadataRichnessEmpty}</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-4">
                          {metadataRichnessDisplayScore !== null ? (
                            <>
                              <span
                                className="text-5xl font-bold tabular-nums"
                                style={{
                                  color:
                                    richnessTier?.colorHex ?? (isDark ? '#fafafa' : '#18181b'),
                                }}
                              >
                                {metadataRichnessDisplayScore.toLocaleString(
                                  lang === 'es' ? 'es-ES' : 'en-US',
                                  { maximumFractionDigits: 2 }
                                )}
                              </span>
                              {richnessTier ? (
                                <span
                                  className="rounded-full px-4 py-2 text-sm font-semibold"
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
                        <p className={`text-sm font-bold ${muted}`}>{t.agentDetailRichnessScoreLabel}</p>
                      </div>
                      <div className="flex w-full shrink-0 flex-col gap-3 lg:max-w-sm lg:items-end lg:text-right">
                        {richnessParsed?.calculatedAt ? (
                          <div className={`text-sm ${muted}`}>
                            <span>{t.agentDetailMetadataRichnessCalculatedAt}: </span>
                            <span className="tabular-nums">{formatDate(richnessParsed.calculatedAt)}</span>
                          </div>
                        ) : null}
                        {richnessParsed ? (
                          <div
                            className={`w-full min-h-[3rem] rounded-xl border px-3 py-2.5 text-left text-sm ${
                              isDark ? 'border-zinc-600/80 bg-zinc-950/60' : 'border-zinc-200 bg-white/90'
                            }`}
                          >
                            {richnessHover ? (
                              <div className="space-y-1">
                                <p className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
                                  {richnessHover.layerTitle}
                                </p>
                                <p className={prose}>
                                  <span className="font-semibold">{richnessHover.segmentLabel}</span>
                                  <span className={`mx-1.5 ${muted}`}>·</span>
                                  <span className="tabular-nums font-semibold">
                                    {richnessHover.value.toLocaleString(
                                      lang === 'es' ? 'es-ES' : 'en-US',
                                      { maximumFractionDigits: 2 }
                                    )}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className={`text-xs leading-snug ${muted}`}>
                                {t.agentDetailMetadataRichnessHoverPlaceholder}
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {richnessParsed ? (
                      <div className={`max-h-[520px] overflow-auto p-6 pb-14 ${cardInlay}`}>
                        <MetadataRichnessLayersChart
                          parsed={richnessParsed}
                          isDark={isDark}
                          t={t}
                          onSegmentHover={setRichnessHover}
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
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="transactional"
            className="xl:col-span-7"
            contentClassName="p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailTransactionalData}</h2>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="min-w-0">
                <div className={`text-sm ${muted}`}>{t.transactionalNonceCurrentLabel}</div>
                <div className="mt-2 text-5xl font-bold tabular-nums">
                  {agent.nonce_current !== null && agent.nonce_current !== undefined
                    ? String(agent.nonce_current)
                    : t.notAvailable}
                </div>
              </div>
              <div className="min-w-0">
                <div className={`text-sm ${muted}`}>{t.transactionalBalanceCurrentLabel}</div>
                <div
                  className={`mt-2 break-all text-3xl font-bold tabular-nums sm:text-4xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  title={
                    stripNumericBalance(agent.balance_current)
                      ? stripNumericBalance(agent.balance_current)
                      : undefined
                  }
                >
                  {stripNumericBalance(agent.balance_current) || t.notAvailable}
                </div>
              </div>
            </div>

            <div className={`mb-6 h-80 p-4 ${cardInlay}`}>
              <AgentTransactionalChart
                data={transactionalChartData}
                series={transactionalSeries}
                isDark={isDark}
                locale={lang === 'es' ? 'es-ES' : 'en-US'}
                emptyMessage={t.agentDetailNoJsonToShow}
                vsPreviousLabel={t.transactionalDeltaVsPrevious}
              />
            </div>

            <div className={`flex flex-wrap gap-2 border-t pt-4 ${isDark ? 'border-gray-800' : 'border-zinc-200'}`}>
              <button
                type="button"
                onClick={() => setTransactionalSeries('nonce')}
                className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                  transactionalSeries === 'nonce' ? tabActive : tabIdle
                }`}
              >
                {t.transactionalTabNonce}
              </button>
              <button
                type="button"
                onClick={() => setTransactionalSeries('balance')}
                className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                  transactionalSeries === 'balance' ? tabActive : tabIdle
                }`}
              >
                {t.transactionalTabBalance}
              </button>
            </div>
          </AgentDetailCard>

          <AgentDetailCard
            isDark={isDark}
            variant="feedback"
            className="xl:col-span-5"
            contentClassName="p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailFeedbackData}</h2>

            <div
              className={`mb-6 flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-gray-800' : 'border-zinc-200'}`}
            >
              <button
                type="button"
                onClick={() => setFeedbackView('analysis')}
                className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                  feedbackView === 'analysis' ? tabActive : tabIdle
                }`}
              >
                {t.agentDetailMetadataViewAnalysis}
              </button>
              <button
                type="button"
                onClick={() => setFeedbackView('data')}
                className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                  feedbackView === 'data' ? tabActive : tabIdle
                }`}
              >
                {t.agentDetailMetadataViewData}
              </button>
            </div>

            {feedbackView === 'analysis' ? (
              <div className={`p-4 ${cardInlay}`}>
                <AgentFeedbackRadarChart
                  axes={feedbackParsed?.axes ?? []}
                  isDark={isDark}
                  t={t}
                  emptyMessage={t.agentDetailFeedbackAnalysisEmpty}
                />
              </div>
            ) : (
              <>
                <div
                  className={`mb-6 flex flex-wrap gap-2 border-b pb-4 ${isDark ? 'border-gray-800' : 'border-zinc-200'}`}
                >
                  {FEEDBACK_ROWS.map((row) => {
                    const enabled =
                      agent[row.hasField] === true && !jsonFieldEmpty(agent[row.summaryField]);
                    return (
                      <button
                        key={row.summaryField}
                        type="button"
                        disabled={!enabled}
                        onClick={() => enabled && setActiveFeedbackSummary(row.summaryField)}
                        className={`rounded-2xl px-5 py-2 text-sm transition-all ${
                          !enabled
                            ? tabDisabled
                            : activeFeedbackSummary === row.summaryField
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
                    {feedbackJson ?? t.agentDetailNoJsonToShow}
                  </pre>
                </div>
              </>
            )}
          </AgentDetailCard>
        </div>
      </div>
    </div>
  );
}
