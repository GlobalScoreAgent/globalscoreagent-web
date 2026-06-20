'use client';

import Image from 'next/image';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { ChainDistributionPanel } from '@/components/dashboard/ChainDistributionPanel';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import { ChainTopAgentsList } from '@/components/dashboard/ChainTopAgentsList';
import {
  buildChainCardData,
  fmtChainCount,
  fmtChainPct,
  formatChainUpdatedAt,
  type ChainCardData,
} from '@/lib/dashboardChainCardData';
import { WARNING_STAT_HELP_TKEY, WARNING_STAT_TKEY, parseMonthlyRows, type DashboardChainRow } from '@/lib/dashboardChains';
import { cn } from '@/lib/utils';

type CardBase = { data: ChainCardData; isDark: boolean; t: Translations };

function formatMonthLabel(ym: string, locale: string): string {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function muted(isDark: boolean) {
  return isDark ? 'text-zinc-400' : 'text-zinc-600';
}

function prose(isDark: boolean) {
  return isDark ? 'text-white' : 'text-zinc-900';
}

export function ChainSummaryCard({ data, isDark, t }: CardBase) {
  const { chain, locale, accent, accentHex, logoSrc } = data;
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={accentHex} className="w-full" contentClassName="p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg"
          style={{
            background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            boxShadow: `0 0 20px ${accent}35`,
          }}
        >
          {logoSrc ? (
            <div className="relative h-full w-full p-2">
              <Image src={logoSrc} alt={chain.name} fill className="object-contain" sizes="56px" unoptimized />
            </div>
          ) : (
            <span className="text-lg font-bold text-zinc-400">{chain.short_name?.slice(0, 2) ?? '?'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={cn('text-lg font-semibold', prose(isDark))}>{chain.name}</h3>
          <p className={cn('text-xs', muted(isDark))}>{chain.chain_id}</p>
          <p className={cn('mt-1 text-xs', muted(isDark))}>
            <span className="opacity-90">{t.chainDataUpdatedLabel}</span>
            <span className="mx-1 opacity-50">·</span>
            <span className="tabular-nums">{formatChainUpdatedAt(chain.updated_at, locale)}</span>
          </p>
        </div>
      </div>
    </AgentDetailCard>
  );
}

function MetricGrid({
  items,
  isDark,
}: {
  items: { label: string; value: string; valueClass?: string }[];
  isDark: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center text-center text-sm">
          <span className={muted(isDark)}>{item.label}</span>
          <div className={cn('font-bold tabular-nums', item.valueClass ?? prose(isDark))}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ChainAgentStatsCard({ data, isDark, t }: CardBase) {
  const { locale, totalAgents, activeAgents, withFeedback } = data;
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-3 text-center text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainSectionAgentInformation}
      </p>
      <MetricGrid
        isDark={isDark}
        items={[
          { label: t.agentsLabel, value: totalAgents !== null ? totalAgents.toLocaleString(locale) : '—' },
          {
            label: t.activeLabel,
            value: activeAgents !== null ? activeAgents.toLocaleString(locale) : '—',
            valueClass: 'text-emerald-500',
          },
          {
            label: t.feedbacksLabel,
            value: withFeedback !== null ? withFeedback.toLocaleString(locale) : '—',
            valueClass: 'text-blue-500',
          },
        ]}
      />
    </AgentDetailCard>
  );
}

export function ChainOwnersCard({ data, isDark, t }: CardBase) {
  const { locale, totalOwners, avgAgentsPerOwner } = data;
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-3 text-center text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainSectionOwners}
      </p>
      <MetricGrid
        isDark={isDark}
        items={[
          { label: t.chainOwnerTotal, value: totalOwners !== null ? totalOwners.toLocaleString(locale) : '—' },
          {
            label: t.chainAvgAgentsPerOwner,
            value:
              avgAgentsPerOwner !== null
                ? avgAgentsPerOwner.toLocaleString(locale, { maximumFractionDigits: 2 })
                : '—',
          },
        ]}
      />
    </AgentDetailCard>
  );
}

export function ChainTechnicalMaturityCard({ data, isDark, t }: CardBase) {
  const { locale, pctX402, pctMcpA2a, countX402, countMcpA2a } = data;
  const mutedCount = isDark ? 'text-zinc-500' : 'text-zinc-400';
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-3 text-center text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainSectionTechnicalMaturity}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[ 
          { label: t.chainPctX402, pct: pctX402, count: countX402 },
          { label: t.chainPctMcpA2a, pct: pctMcpA2a, count: countMcpA2a },
        ].map((row) => (
          <div key={row.label} className="flex flex-col items-center text-center text-sm">
            <span className={muted(isDark)}>{row.label}</span>
            <div className={cn('font-bold tabular-nums', prose(isDark))}>
              {fmtChainPct(row.pct, locale)}
              {row.count !== null ? (
                <span className={cn('ml-1.5 text-xs font-normal', mutedCount)}>({fmtChainCount(row.count, locale)})</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AgentDetailCard>
  );
}

export function ChainTop10HumiCard({ data, isDark, t }: CardBase) {
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <ChainTopAgentsList agents={data.topAgents} isDark={isDark} t={t} locale={data.locale} className="min-h-0 border-0 bg-transparent p-0" />
    </AgentDetailCard>
  );
}

export function ChainActivity30dCard({ data, isDark, t }: CardBase) {
  const {
    locale,
    showLast30Section,
    pctActive,
    d30Total,
    d30Active,
    newAgents30d,
    pctWallet,
    pctOnchain,
    onChainExec,
    onChainPay,
    onChainProto,
  } = data;

  const rows = [
    { label: t.chainStatPctActive, value: fmtChainPct(pctActive, locale) },
    { label: t.agentsLabel, value: d30Total !== null ? d30Total.toLocaleString(locale) : '—' },
    { label: t.activeLabel, value: d30Active !== null ? d30Active.toLocaleString(locale) : '—', green: true },
    { label: t.chainStatNewAgents30d, value: newAgents30d !== null ? newAgents30d.toLocaleString(locale) : '—' },
    { label: t.chainStatPctWalletActivity, value: fmtChainPct(pctWallet, locale) },
    { label: t.chainStatPctOnchainActivity, value: fmtChainPct(pctOnchain, locale) },
    { label: t.chainOnChainExecutions30d, value: fmtChainCount(onChainExec, locale) },
    { label: t.chainOnChainPayments30d, value: fmtChainCount(onChainPay, locale) },
    { label: t.chainOnChainProtocolActivity30d, value: fmtChainCount(onChainProto, locale) },
  ];

  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-3 text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainSectionLast30Days}
      </p>
      {showLast30Section ? (
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col">
              <span className={muted(isDark)}>{row.label}</span>
              <span className={cn('font-semibold tabular-nums', row.green ? 'text-emerald-500' : prose(isDark))}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={cn('text-xs', muted(isDark))}>{t.dashboardChainsEmpty}</p>
      )}
    </AgentDetailCard>
  );
}

export function ChainWarningsCard({ data, isDark, t }: CardBase) {
  const { locale, warningStats } = data;
  const mutedCount = isDark ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-3 text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainSectionWarnings}
      </p>
      {warningStats.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {warningStats.map(({ key, value, count }) => (
            <div key={key}>
              <div className="flex items-start gap-0.5">
                <span className={muted(isDark)}>{t[WARNING_STAT_TKEY[key]]}</span>
                <DashboardInfoTooltip
                  content={t[WARNING_STAT_HELP_TKEY[key]]}
                  ariaLabel={t.chainWarningInfoAriaLabel}
                  isDark={isDark}
                />
              </div>
              <div className={cn('font-semibold tabular-nums', prose(isDark))}>
                {fmtChainPct(value, locale)}
                {count !== null ? (
                  <span className={cn('ml-1.5 text-[11px] font-normal', mutedCount)}>
                    ({fmtChainCount(count, locale)})
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={cn('text-xs', muted(isDark))}>{t.dashboardChainsEmpty}</p>
      )}
    </AgentDetailCard>
  );
}

export function ChainMonthlyTrendCard({ data, isDark, t }: CardBase) {
  const parsed = parseMonthlyRows(data.chain.statistics_agent_monthly);
  if (parsed.length === 0) return null;

  const lineColor = isDark ? '#34d399' : '#059669';
  const lineColor2 = isDark ? '#60a5fa' : '#2563eb';
  const lineColor3 = isDark ? '#fbbf24' : '#d97706';
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const chartData = parsed.map((r) => ({
    label: formatMonthLabel(r.month, data.locale),
    new_agents: r.new_agents ?? undefined,
    total_agents: r.total_agents ?? undefined,
    active_agents: r.active_agents ?? undefined,
  }));

  const hasNew = chartData.some((d) => d.new_agents !== undefined);
  const hasTotal = chartData.some((d) => d.total_agents !== undefined);
  const hasActive = chartData.some((d) => d.active_agents !== undefined);
  if (!hasNew && !hasTotal && !hasActive) return null;

  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wide', muted(isDark))}>
        {t.chainChartMonthlyTitle}
      </p>
      <div className="h-48 w-full sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
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
            <Legend wrapperStyle={{ fontSize: 11 }} className="hidden sm:block" />
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
    </AgentDetailCard>
  );
}

export function ChainDistributionCard({ data, isDark, t }: CardBase) {
  if (data.distributionSlides.length === 0) return null;
  return (
    <AgentDetailCard isDark={isDark} variant="chain" accentHex={data.accentHex} className="w-full" contentClassName="p-4">
      <ChainDistributionPanel
        slides={data.distributionSlides}
        chainKey={data.chain.chain_id}
        isDark={isDark}
        t={t}
        className="w-full lg:w-full"
      />
    </AgentDetailCard>
  );
}

export function ChainCardsStack({
  chain,
  lang,
  isDark,
  t,
}: {
  chain: DashboardChainRow;
  lang: 'es' | 'en';
  isDark: boolean;
  t: Translations;
}) {
  const data = buildChainCardData(chain, lang, t);
  const cardProps = { data, isDark, t };

  return (
    <div className="flex w-full flex-col gap-4">
      <ChainTop10HumiCard {...cardProps} />
      <ChainSummaryCard {...cardProps} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChainAgentStatsCard {...cardProps} />
        <ChainOwnersCard {...cardProps} />
        <ChainTechnicalMaturityCard {...cardProps} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChainActivity30dCard {...cardProps} />
        <ChainWarningsCard {...cardProps} />
      </div>
      <ChainMonthlyTrendCard {...cardProps} />
      <ChainDistributionCard {...cardProps} />
    </div>
  );
}
