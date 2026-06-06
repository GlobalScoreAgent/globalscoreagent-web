'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { ChainDistributionPanel, type ChainDistributionSlide } from '@/components/dashboard/ChainDistributionPanel';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import { ChainTopAgentsList } from '@/components/dashboard/ChainTopAgentsList';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';
import { cn } from '@/lib/utils';
import {
  chainAccentColor,
  chainAccentHex,
  METADATA_BUCKET_COLORS,
  METADATA_ORDER,
  MATURITY_COLORS,
  MATURITY_ORDER,
  MATURITY_TKEY,
  METADATA_TKEY,
  normalizeMaturityDistribution,
  normalizeMetadataDistribution,
  numFromJson,
  parseBest10AgentsHumi,
  parseMonthlyRows,
  parseWarningStats,
  WARNING_STAT_HELP_TKEY,
  WARNING_STAT_TKEY,
  type DashboardChainRow,
} from '@/lib/dashboardChains';

type Props = {
  chains: DashboardChainRow[];
  isDark: boolean;
  t: Translations;
  lang: 'es' | 'en';
};

function formatChainUpdatedAt(iso: string | null | undefined, locale: string): string {
  if (iso == null || iso === '') return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

function formatMonthLabel(ym: string, locale: string): string {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function MonthlyAgentsChart({
  rows,
  isDark,
  locale,
  t,
}: {
  rows: DashboardChainRow['statistics_agent_monthly'];
  isDark: boolean;
  locale: string;
  t: Translations;
}) {
  const parsed = parseMonthlyRows(rows);
  if (parsed.length === 0) return null;

  const lineColor = isDark ? '#34d399' : '#059669';
  const lineColor2 = isDark ? '#60a5fa' : '#2563eb';
  const lineColor3 = isDark ? '#fbbf24' : '#d97706';
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  const data = parsed.map((r) => ({
    label: formatMonthLabel(r.month, locale),
    new_agents: r.new_agents ?? undefined,
    total_agents: r.total_agents ?? undefined,
    active_agents: r.active_agents ?? undefined,
  }));

  const hasNew = data.some((d) => d.new_agents !== undefined);
  const hasTotal = data.some((d) => d.total_agents !== undefined);
  const hasActive = data.some((d) => d.active_agents !== undefined);
  if (!hasNew && !hasTotal && !hasActive) return null;

  return (
    <div className="space-y-1">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
        {t.chainChartMonthlyTitle}
      </p>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: tickFill, fontSize: 10 }} stroke={axisStroke} />
            <YAxis tick={{ fill: tickFill, fontSize: 10 }} stroke={axisStroke} width={44} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#18181b' : '#fff',
                border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {hasNew ? (
              <Line type="monotone" dataKey="new_agents" name={t.chainSeriesNewAgents} stroke={lineColor} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            ) : null}
            {hasTotal ? (
              <Line type="monotone" dataKey="total_agents" name={t.chainSeriesTotalAgents} stroke={lineColor2} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            ) : null}
            {hasActive ? (
              <Line type="monotone" dataKey="active_agents" name={t.chainSeriesActiveAgents} stroke={lineColor3} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChainCard({ chain, isDark, t, lang }: { chain: DashboardChainRow; isDark: boolean; t: Translations; lang: 'es' | 'en' }) {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const accent = chainAccentColor(chain.chain_id);
  const accentHex = chainAccentHex(chain.chain_id);
  const logoSrc = publicChainLogoUrl(chain.logo_file_name);

  const agentJson = chain.agent_stats_information;
  const totalAgents = numFromJson(agentJson, 'total_agents');
  const activeAgents = numFromJson(agentJson, 'active_agents');
  const withFeedback = numFromJson(agentJson, 'agents_with_feedback');

  const ownerJson = chain.owner_stats_information;
  const totalOwners = numFromJson(ownerJson, 'total_owners');
  const avgAgentsPerOwner = numFromJson(ownerJson, 'avg_agents_per_owner');

  const d30 = chain.statistics_agent_last_30_days;
  const pctActive = numFromJson(d30, 'pct_active');
  const d30Total = numFromJson(d30, 'total_agents');
  const d30Active = numFromJson(d30, 'active_agents');
  const newAgents30d = numFromJson(d30, 'new_agents_30d');
  const pctWallet = numFromJson(d30, 'pct_with_wallet_activity');
  const pctOnchain = numFromJson(d30, 'pct_with_onchain_activity');

  const techJson = chain.technical_data_information;
  const pctX402 = numFromJson(techJson, 'pct_x402');
  const pctMcpA2a = numFromJson(techJson, 'pct_mcp_a2a');

  const warningStats = parseWarningStats(chain.warning_stats_information);
  const topAgents = parseBest10AgentsHumi(chain.best_10_agents_humi);

  const warningsRef = useRef<HTMLDivElement>(null);
  const [syncedRowHeight, setSyncedRowHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const el = warningsRef.current;
    if (!el) return;

    const mq = window.matchMedia('(min-width: 1024px)');

    const measure = () => {
      if (!mq.matches) {
        setSyncedRowHeight(undefined);
        return;
      }
      setSyncedRowHeight(el.offsetHeight);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener('change', measure);

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', measure);
    };
  }, [warningStats, lang]);

  const syncedCardStyle = syncedRowHeight != null ? { height: syncedRowHeight } : undefined;
  const metricMiniShell = isDark ? 'border-zinc-700 bg-black/15' : 'border-zinc-200 bg-white/60';

  const onChainJson = chain.on_chain_stats_information;
  const onChainExec = numFromJson(onChainJson, 'total_executions_30d');
  const onChainPay = numFromJson(onChainJson, 'total_with_payments_30d');
  const onChainProto = numFromJson(onChainJson, 'total_protocol_activity_30d');

  const hasLast30Legacy =
    pctActive !== null ||
    d30Total !== null ||
    d30Active !== null ||
    newAgents30d !== null ||
    pctWallet !== null ||
    pctOnchain !== null;
  const hasLast30OnChain = onChainExec !== null || onChainPay !== null || onChainProto !== null;
  const showLast30Section = hasLast30Legacy || hasLast30OnChain;

  const fmtPct = (n: number | null) =>
    n === null || !Number.isFinite(n) ? '—' : `${n.toLocaleString(locale, { maximumFractionDigits: 2 })}%`;
  const fmtCount = (n: number | null) =>
    n === null || !Number.isFinite(n) ? '—' : Number(n).toLocaleString(locale, { maximumFractionDigits: 0 });

  const humiNormalized = normalizeMaturityDistribution(chain.humi_distribution);
  const humiRow: Record<string, number | string> = { name: chain.short_name || chain.name };
  const humiBarKeys = MATURITY_ORDER.map((s) => s.key).filter((k) => (humiNormalized[k] ?? 0) > 0);
  MATURITY_ORDER.forEach((s) => {
    if ((humiNormalized[s.key] ?? 0) > 0) humiRow[s.key] = humiNormalized[s.key];
  });

  const wamiNormalized = normalizeMaturityDistribution(chain.wami_distribution);
  const wamiRow: Record<string, number | string> = { name: chain.short_name || chain.name };
  const wamiBarKeys = MATURITY_ORDER.map((s) => s.key).filter((k) => (wamiNormalized[k] ?? 0) > 0);
  MATURITY_ORDER.forEach((s) => {
    if ((wamiNormalized[s.key] ?? 0) > 0) wamiRow[s.key] = wamiNormalized[s.key];
  });

  const metaNormalized = normalizeMetadataDistribution(chain.metadata_distribution);
  const metaRow: Record<string, number | string> = { name: chain.short_name || chain.name };
  const metaBarKeys = METADATA_ORDER.map((s) => s.key).filter((k) => (metaNormalized[k] ?? 0) > 0);
  METADATA_ORDER.forEach((s) => {
    if ((metaNormalized[s.key] ?? 0) > 0) metaRow[s.key] = metaNormalized[s.key];
  });

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const prose = isDark ? 'text-white' : 'text-zinc-900';

  const miniCardShell = isDark ? 'border-zinc-700 bg-black/20' : 'border-zinc-200 bg-zinc-50';

  const showDistributionRail = humiBarKeys.length > 0 || metaBarKeys.length > 0 || wamiBarKeys.length > 0;

  const distributionSlides = useMemo((): ChainDistributionSlide[] => {
    const slides: ChainDistributionSlide[] = [];
    if (humiBarKeys.length > 0) {
      slides.push({
        id: 'humi',
        metricLabel: t.chainDistributionRailHumi,
        rowKeys: humiBarKeys,
        row: humiRow,
        colors: (k) => MATURITY_COLORS[k as keyof typeof MATURITY_COLORS] ?? '#71717a',
        labelForKey: (k) => {
          const tk = MATURITY_TKEY[k as keyof typeof MATURITY_TKEY];
          const seg = MATURITY_ORDER.find((s) => s.key === k);
          return tk && seg ? `${seg.scoreRange} · ${t[tk]}` : k;
        },
      });
    }
    if (metaBarKeys.length > 0) {
      slides.push({
        id: 'meta',
        metricLabel: t.chainDistributionRailMetadata,
        rowKeys: metaBarKeys,
        row: metaRow,
        colors: (k) => {
          const tkey = METADATA_TKEY[k as keyof typeof METADATA_TKEY];
          return tkey ? METADATA_BUCKET_COLORS[tkey] ?? '#71717a' : '#71717a';
        },
        labelForKey: (k) => {
          const tkey = METADATA_TKEY[k as keyof typeof METADATA_TKEY];
          const seg = METADATA_ORDER.find((s) => s.key === k);
          return tkey && seg ? `${seg.scoreRange} · ${t[tkey]}` : k;
        },
      });
    }
    if (wamiBarKeys.length > 0) {
      slides.push({
        id: 'wami',
        metricLabel: t.chainDistributionRailWami,
        rowKeys: wamiBarKeys,
        row: wamiRow,
        colors: (k) => MATURITY_COLORS[k as keyof typeof MATURITY_COLORS] ?? '#71717a',
        labelForKey: (k) => {
          const tk = MATURITY_TKEY[k as keyof typeof MATURITY_TKEY];
          const seg = MATURITY_ORDER.find((s) => s.key === k);
          return tk && seg ? `${seg.scoreRange} · ${t[tk]}` : k;
        },
      });
    }
    return slides;
  }, [humiBarKeys, metaBarKeys, wamiBarKeys, humiRow, metaRow, wamiRow, t]);

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="chain"
      accentHex={accentHex}
      className="w-full"
      contentClassName="p-5"
    >
      <div className={cn('relative flex flex-col gap-4', showDistributionRail && 'lg:flex-row lg:items-stretch lg:gap-5')}>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg"
            style={{
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              boxShadow: `0 0 20px ${accent}35`,
            }}
          >
            {logoSrc ? (
              <div className="relative h-full min-h-0 w-full min-w-0 p-2">
                <Image
                  src={logoSrc}
                  alt={chain.name}
                  fill
                  className="object-contain"
                  sizes="56px"
                  unoptimized
                />
              </div>
            ) : (
              <span className="text-lg font-bold text-zinc-400">{chain.short_name?.slice(0, 2) ?? '?'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold ${prose}`}>{chain.name}</h3>
            <p className={`text-xs ${muted}`}>{chain.chain_id}</p>
            <p className={`mt-1 text-xs ${muted}`}>
              <span className="opacity-90">{t.chainDataUpdatedLabel}</span>
              <span className="mx-1 opacity-50">·</span>
              <span className="tabular-nums">{formatChainUpdatedAt(chain.updated_at, locale)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className={`rounded-2xl border px-3 py-2 text-center ${miniCardShell}`}>
            <p className={`mb-2 text-center text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.chainSectionAgentInformation}</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm sm:gap-x-10">
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.agentsLabel}</span>
                <div className={`font-bold tabular-nums ${prose}`}>{totalAgents !== null ? totalAgents.toLocaleString(locale) : '—'}</div>
              </div>
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.activeLabel}</span>
                <div className="font-bold tabular-nums text-emerald-500">{activeAgents !== null ? activeAgents.toLocaleString(locale) : '—'}</div>
              </div>
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.feedbacksLabel}</span>
                <div className="font-bold tabular-nums text-blue-500">{withFeedback !== null ? withFeedback.toLocaleString(locale) : '—'}</div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border px-3 py-2 text-center ${miniCardShell}`}>
            <p className={`mb-2 text-center text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.chainSectionOwners}</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm sm:gap-x-10">
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.chainOwnerTotal}</span>
                <div className={`font-bold tabular-nums ${prose}`}>{totalOwners !== null ? totalOwners.toLocaleString(locale) : '—'}</div>
              </div>
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.chainAvgAgentsPerOwner}</span>
                <div className={`font-bold tabular-nums ${prose}`}>
                  {avgAgentsPerOwner !== null ? avgAgentsPerOwner.toLocaleString(locale, { maximumFractionDigits: 2 }) : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border px-3 py-2 text-center ${miniCardShell}`}>
            <p className={`mb-2 text-center text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.chainSectionTechnicalMaturity}</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm sm:gap-x-10">
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.chainPctX402}</span>
                <div className={`font-bold tabular-nums ${prose}`}>{fmtPct(pctX402)}</div>
              </div>
              <div className="flex min-w-0 flex-col items-center text-center">
                <span className={muted}>{t.chainPctMcpA2a}</span>
                <div className={`font-bold tabular-nums ${prose}`}>{fmtPct(pctMcpA2a)}</div>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start">
          <ChainTopAgentsList
            agents={topAgents}
            isDark={isDark}
            t={t}
            locale={locale}
            className="min-h-0"
            style={syncedCardStyle}
          />

          <div
            className={cn('flex min-h-0 flex-col rounded-2xl border px-3 py-2', metricMiniShell)}
            style={syncedCardStyle}
          >
            <p className={`mb-1.5 shrink-0 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
              {t.chainSectionLast30Days}
            </p>
            {showLast30Section ? (
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-2 text-xs sm:grid-cols-3 sm:grid-rows-3">
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainStatPctActive}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtPct(pctActive)}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.agentsLabel}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>
                    {d30Total !== null ? d30Total.toLocaleString(locale) : '—'}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.activeLabel}</span>
                  <div className="font-semibold tabular-nums text-emerald-500">
                    {d30Active !== null ? d30Active.toLocaleString(locale) : '—'}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainStatNewAgents30d}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>
                    {newAgents30d !== null ? newAgents30d.toLocaleString(locale) : '—'}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainStatPctWalletActivity}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtPct(pctWallet)}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainStatPctOnchainActivity}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtPct(pctOnchain)}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainOnChainExecutions30d}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtCount(onChainExec)}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainOnChainPayments30d}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtCount(onChainPay)}</div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className={muted}>{t.chainOnChainProtocolActivity30d}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{fmtCount(onChainProto)}</div>
                </div>
              </div>
            ) : (
              <p className={`text-xs ${muted}`}>{t.dashboardChainsEmpty}</p>
            )}
          </div>

          <div ref={warningsRef} className={cn('rounded-2xl border px-3 py-2', metricMiniShell)}>
            <p className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
              {t.chainSectionWarnings}
            </p>
            {warningStats.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-2 gap-y-2.5 text-xs sm:grid-cols-3 sm:gap-y-3">
                {warningStats.map(({ key, value }) => (
                  <div key={key}>
                    <div className="flex items-start gap-0.5">
                      <span className={muted}>{t[WARNING_STAT_TKEY[key]]}</span>
                      <DashboardInfoTooltip
                        content={t[WARNING_STAT_HELP_TKEY[key]]}
                        ariaLabel={t.chainWarningInfoAriaLabel}
                        isDark={isDark}
                      />
                    </div>
                    <div className={`font-semibold tabular-nums ${prose}`}>{fmtPct(value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${muted}`}>{t.dashboardChainsEmpty}</p>
            )}
          </div>
        </div>

        <MonthlyAgentsChart rows={chain.statistics_agent_monthly} isDark={isDark} locale={locale} t={t} />
        </div>

        {showDistributionRail ? (
          <ChainDistributionPanel
            slides={distributionSlides}
            chainKey={chain.chain_id}
            isDark={isDark}
            t={t}
          />
        ) : null}
      </div>
    </AgentDetailCard>
  );
}

export function DashboardChainCards({ chains, isDark, t, lang }: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex((i) => {
      if (chains.length === 0) return 0;
      return Math.min(i, chains.length - 1);
    });
  }, [chains.length]);

  if (!chains.length) {
    return (
      <div className={`flex min-h-[120px] items-center justify-center rounded-3xl border p-8 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}>
        <p className={muted}>{t.dashboardChainsEmpty}</p>
      </div>
    );
  }

  const active = chains[selectedIndex];
  if (!active) {
    return (
      <div className={`flex min-h-[120px] items-center justify-center rounded-3xl border p-8 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}>
        <p className={muted}>{t.dashboardChainsEmpty}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <motion.div
        key={active.chain_id}
        className="w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ChainCard chain={active} isDark={isDark} t={t} lang={lang} />
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4">
        {chains.map((c, index) => (
          <button
            key={c.chain_id}
            type="button"
            aria-label={c.name}
            title={c.short_name || c.name}
            onClick={() => setSelectedIndex(index)}
            className={`h-4 w-4 rounded-full transition-all duration-300 ${
              selectedIndex === index
                ? 'scale-125 shadow-lg'
                : `bg-zinc-600 hover:bg-zinc-500 ${isDark ? 'hover:bg-zinc-400' : 'hover:bg-zinc-500'}`
            }`}
            style={{
              backgroundColor: selectedIndex === index ? chainAccentColor(c.chain_id) : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
