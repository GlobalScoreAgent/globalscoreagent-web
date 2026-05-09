'use client';

import Image from 'next/image';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartLabelResolver } from '@/lib/agentDeltaSeries';
import {
  buildBalanceDeltaSeries,
  buildNonceDeltaSeries,
} from '@/lib/agentDeltaSeries';
import { getHumiScoreColor, getHumiScoreText } from '@/lib/agentHumiDisplay';
import { normalizeChainName } from '@/lib/agentChains';
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
  const { t, lang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentDetailRow | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [chainLogoFailed, setChainLogoFailed] = useState(false);

  const [descModalOpen, setDescModalOpen] = useState(false);
  const [transactionalSeries, setTransactionalSeries] = useState<'nonce' | 'balance'>('nonce');

  const [activeMetaField, setActiveMetaField] = useState<string | null>(null);
  const [activeFeedbackSummary, setActiveFeedbackSummary] = useState<string | null>(null);

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

  const chainLogoSrc = useMemo(() => {
    const logo = agent?.chain_logo_file_name;
    if (typeof logo !== 'string' || !logo.trim()) return null;
    const s = logo.trim();
    if (s.includes('/')) return s.startsWith('/') ? s : `/${s}`;
    return `/${s}`;
  }, [agent?.chain_logo_file_name]);

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

  const normalizedChainDisplay = normalizeChainName(
    typeof agent?.chain_name === 'string' ? agent.chain_name : ''
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-300">
        <p>{t.agentDetailLoading}</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center text-zinc-300">
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {descModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setDescModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="desc-modal-title"
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-700 bg-[#111111] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id="desc-modal-title" className="text-xl font-semibold">
                {t.descriptionModalTitle}
              </h2>
              <button
                type="button"
                className="rounded-xl border border-gray-600 px-4 py-2 text-sm hover:bg-white/10"
                onClick={() => setDescModalOpen(false)}
              >
                {t.closeModal}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">{description}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex w-80 max-w-full flex-shrink-0 flex-col gap-4 mx-auto lg:mx-0">
            <div className="relative h-80 w-full rounded-3xl overflow-hidden border border-gray-700 shadow-2xl bg-zinc-900">
              <Image
                src={imageSrcPrimary}
                alt={String(agent.name ?? 'Agent')}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgFailed(true)}
              />
            </div>
            <div className="rounded-2xl border border-gray-800 bg-[#111111] p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t.agentDetailProfilesCardTitle}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profileKeys.map((pk) => (
                  <span
                    key={pk}
                    className="rounded-full border border-gray-600 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-200"
                  >
                    {formatProfileBadgeLabel(pk)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 pt-4 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {String(agent.name ?? '')}
                </h1>
                {agent.on_chain_id ? (
                  <span className="max-w-full truncate rounded-full border border-gray-600 bg-white/5 px-3 py-1 font-mono text-xs text-gray-300">
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

            <div className="flex flex-wrap items-baseline gap-4 mt-4">
              <div
                className={`text-7xl font-bold ${
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
              <div className="text-2xl text-gray-400">{t.agentDetailHumiScoreLabel}</div>
              <button
                type="button"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-2xl bg-white/5 hover:bg-white/10 border border-gray-700 transition-colors"
              >
                {t.agentDetailViewDetails}
              </button>
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
                <p className="text-xl text-gray-300 leading-relaxed">
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
              <p className="mt-6 text-xl text-gray-500">{t.noDescription}</p>
            )}

            <div className="flex gap-4 mt-8 flex-wrap">
              {webHref ? (
                <a
                  href={webHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-sm"
                >
                  <ExternalLink size={14} className="shrink-0 opacity-80" />
                  {t.agentDetailWeb}
                </a>
              ) : null}
              {emailHref ? (
                <a
                  href={emailHref}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-sm"
                >
                  <Mail size={14} className="shrink-0 opacity-80" />
                  {t.agentDetailEmail}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="relative xl:col-span-5 bg-[#111111] rounded-3xl p-8 pb-16 border border-gray-800 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailOnChainData}</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {chainLogoSrc && !chainLogoFailed ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gray-700 bg-black/40">
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
                  <div className="text-sm text-gray-400">{t.agentDetailChainLabel}</div>
                  <div className="font-medium">{normalizedChainDisplay || t.notAvailable}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">{t.agentDetailWalletOnChainIdInfo}</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {agent.wallet_chain_register ? String(agent.wallet_chain_register) : t.notAvailable}
                  {typeof agent.wallet_chain_register === 'string' &&
                  (agent.wallet_chain_register as string).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(agent.wallet_chain_register))}
                      className="text-gray-400 hover:text-white shrink-0"
                    >
                      <Copy size={16} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400">{t.agentDetailCreatedAt}</div>
                  <div className="mt-1">
                    {typeof agent.on_chain_created_at === 'string'
                      ? formatDate(agent.on_chain_created_at as string)
                      : t.notAvailable}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">{t.agentDetailOwnerChanges}</div>
                  <div className="mt-1 font-medium">
                    {agent.owner_changes !== undefined && agent.owner_changes !== null
                      ? String(agent.owner_changes)
                      : t.notAvailable}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">{t.agentDetailOwnerWallet}</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {agent.owner_wallet ? String(agent.owner_wallet) : t.notAvailable}
                  {typeof agent.owner_wallet === 'string' && (agent.owner_wallet as string).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(agent.owner_wallet))}
                      className="text-gray-400 hover:text-white shrink-0"
                    >
                      <Copy size={16} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">{t.agentDetailOwnerSince}</div>
                <div className="mt-1">
                  {typeof agent.owner_since_at === 'string'
                    ? formatDate(agent.owner_since_at as string)
                    : t.notAvailable}
                </div>
              </div>
            </div>

            {agent.gobernance_type ? (
              <div className="absolute bottom-6 right-6 max-w-[55%]">
                <span className="inline-block rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  {String(agent.gobernance_type)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="xl:col-span-7 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">{t.agentDetailMetadataInformation}</h2>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  agent.has_x402 === true
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {agent.has_x402 === true ? t.metadataX402Enabled : t.metadataX402Disabled}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
              {METADATA_ROWS.map((row) => {
                const empty = jsonFieldEmpty(agent[row.field]);
                return (
                  <button
                    key={row.field}
                    type="button"
                    disabled={empty}
                    onClick={() => !empty && setActiveMetaField(row.field)}
                    className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                      empty
                        ? 'cursor-not-allowed bg-gray-900 text-gray-600 border border-gray-800'
                        : activeMetaField === row.field
                          ? 'bg-white text-black font-medium'
                          : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {t[row.labelKey]}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 overflow-auto max-h-[520px]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {metaJson ?? t.agentDetailNoJsonToShow}
              </pre>
            </div>
          </div>

          <div className="xl:col-span-7 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailTransactionalData}</h2>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div className="min-w-0">
                <div className="text-sm text-gray-400">{t.transactionalNonceCurrentLabel}</div>
                <div className="mt-2 text-5xl font-bold tabular-nums">
                  {agent.nonce_current !== null && agent.nonce_current !== undefined
                    ? String(agent.nonce_current)
                    : t.notAvailable}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-400">{t.transactionalBalanceCurrentLabel}</div>
                <div
                  className="mt-2 break-all text-3xl font-bold tabular-nums text-emerald-400 sm:text-4xl"
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

            <div className="mb-6 bg-[#1a1a1a] p-4 rounded-2xl border border-gray-700 h-80">
              {transactionalChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  {t.agentDetailNoJsonToShow}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transactionalChartData}
                    margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
                  >
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      stroke="#374151"
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      stroke="#374151"
                      width={48}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                      }}
                      labelStyle={{ color: '#e5e7eb' }}
                      itemStyle={{ color: '#34d399' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#34d399' }}
                      activeDot={{ r: 5 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-800 pt-4">
              <button
                type="button"
                onClick={() => setTransactionalSeries('nonce')}
                className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                  transactionalSeries === 'nonce'
                    ? 'bg-white text-black font-medium'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {t.transactionalTabNonce}
              </button>
              <button
                type="button"
                onClick={() => setTransactionalSeries('balance')}
                className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                  transactionalSeries === 'balance'
                    ? 'bg-white text-black font-medium'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {t.transactionalTabBalance}
              </button>
            </div>
          </div>

          <div className="xl:col-span-5 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">{t.agentDetailFeedbackData}</h2>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
              {FEEDBACK_ROWS.map((row) => {
                const enabled =
                  agent[row.hasField] === true && !jsonFieldEmpty(agent[row.summaryField]);
                return (
                  <button
                    key={row.summaryField}
                    type="button"
                    disabled={!enabled}
                    onClick={() => enabled && setActiveFeedbackSummary(row.summaryField)}
                    className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                      !enabled
                        ? 'cursor-not-allowed bg-gray-900 text-gray-600 border border-gray-800'
                        : activeFeedbackSummary === row.summaryField
                          ? 'bg-white text-black font-medium'
                          : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {t[row.labelKey]}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 overflow-auto max-h-[520px]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {feedbackJson ?? t.agentDetailNoJsonToShow}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
