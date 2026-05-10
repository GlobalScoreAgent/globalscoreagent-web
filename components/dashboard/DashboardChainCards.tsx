'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';
import {
  chainAccentColor,
  HUMI_BUCKET_COLORS,
  HUMI_BUCKET_ORDER,
  HUMI_BUCKET_TKEY,
  METADATA_BUCKET_COLORS,
  METADATA_DB_KEY_TO_TKEY,
  numFromJson,
  parseMonthlyRows,
  recordToNumberMap,
  sortedMetadataKeys,
  type DashboardChainRow,
} from '@/lib/dashboardChains';

type Props = {
  chains: DashboardChainRow[];
  isDark: boolean;
  t: Translations;
  lang: 'es' | 'en';
};

function formatMonthLabel(ym: string, locale: string): string {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return ym;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function StackedDistributionBar({
  title,
  rowKeys,
  row,
  colors,
  labelForKey,
  isDark,
}: {
  title: string;
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
  isDark: boolean;
}) {
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  if (rowKeys.length === 0) return null;

  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  if (total <= 0) return null;

  return (
    <div className="space-y-1">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
        {title}
      </p>
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={[row]}
            margin={{ top: 2, right: 8, left: 4, bottom: 2 }}
          >
            <XAxis type="number" stroke={axisStroke} tick={{ fill: tickFill, fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={1} hide />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                return (
                  <div
                    className={`rounded-lg border px-2 py-1.5 text-xs shadow-md ${
                      isDark ? 'border-zinc-600 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
                    }`}
                  >
                    {payload.map((p) => (
                      <div key={String(p.dataKey)} className="tabular-nums">
                        <span className="opacity-80">{labelForKey(String(p.dataKey))}: </span>
                        <span className="font-semibold">{Number(p.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            {rowKeys.map((k) => (
              <Bar
                key={k}
                dataKey={k}
                stackId="stack"
                fill={colors(k)}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
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
  const logoSrc = publicChainLogoUrl(chain.logo_file_name);

  const agentJson = chain.agent_stats_information;
  const totalAgents = numFromJson(agentJson, 'total_agents');
  const activeAgents = numFromJson(agentJson, 'active_agents');
  const withFeedback = numFromJson(agentJson, 'agents_with_feedback');
  const pctHighHumi = numFromJson(agentJson, 'pct_high_humi');

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

  const humiDist = recordToNumberMap(chain.humi_distribution);
  const humiRow: Record<string, number | string> = { name: chain.short_name || chain.name };
  HUMI_BUCKET_ORDER.forEach((k) => {
    if (k in humiDist) humiRow[k] = humiDist[k];
  });
  const humiBarKeys = HUMI_BUCKET_ORDER.filter((k) => k in humiDist);

  const metaDist = recordToNumberMap(chain.metadata_distribution);
  const metaKeysSorted = sortedMetadataKeys(Object.keys(metaDist));
  const metaRow: Record<string, number | string> = { name: chain.short_name || chain.name };
  const metaBarKeys: string[] = [];
  metaKeysSorted.forEach((dbKey) => {
    const v = metaDist[dbKey];
    if (v === undefined) return;
    const slug = dbKey.replace(/\s+/g, '_').replace(/[()]/g, '');
    metaRow[slug] = v;
    metaBarKeys.push(slug);
  });

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const prose = isDark ? 'text-white' : 'text-zinc-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-3xl border p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 relative overflow-hidden ${
        isDark ? 'border-zinc-700/50 bg-zinc-900/80' : 'border-zinc-200/80 bg-white/90'
      }`}
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${accent}12 0%, rgba(39,39,42,0.88) 35%, rgba(24,24,27,0.96) 100%)`
          : `linear-gradient(135deg, ${accent}14 0%, rgba(255,255,255,0.95) 40%, rgba(250,250,250,0.98) 100%)`,
        boxShadow: isDark
          ? `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px ${accent}28`
          : `0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px ${accent}30`,
      }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`, transform: 'translate(12px,-12px)' }}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              boxShadow: `0 0 20px ${accent}35`,
            }}
          >
            {logoSrc ? (
              <Image src={logoSrc} alt={chain.name} width={40} height={40} className="object-contain" unoptimized />
            ) : (
              <span className="text-lg font-bold text-zinc-400">{chain.short_name?.slice(0, 2) ?? '?'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold ${prose}`}>{chain.name}</h3>
            <p className={`text-xs ${muted}`}>{chain.chain_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
          <div>
            <span className={muted}>{t.agentsLabel}</span>
            <div className={`font-bold tabular-nums ${prose}`}>{totalAgents !== null ? totalAgents.toLocaleString(locale) : '—'}</div>
          </div>
          <div>
            <span className={muted}>{t.activeLabel}</span>
            <div className="font-bold tabular-nums text-emerald-500">{activeAgents !== null ? activeAgents.toLocaleString(locale) : '—'}</div>
          </div>
          <div>
            <span className={muted}>{t.feedbacksLabel}</span>
            <div className="font-bold tabular-nums text-blue-500">{withFeedback !== null ? withFeedback.toLocaleString(locale) : '—'}</div>
          </div>
          {pctHighHumi !== null ? (
            <div>
              <span className={muted}>{t.chainStatPctHighHumi}</span>
              <div className={`font-bold tabular-nums ${prose}`}>
                {(pctHighHumi * 100).toLocaleString(locale, { maximumFractionDigits: 2 })}%
              </div>
            </div>
          ) : null}
        </div>

        {(totalOwners !== null || avgAgentsPerOwner !== null) && (
          <div className={`rounded-2xl border px-3 py-2 ${isDark ? 'border-zinc-700 bg-black/20' : 'border-zinc-200 bg-zinc-50'}`}>
            <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.chainSectionOwners}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              {totalOwners !== null ? (
                <div>
                  <span className={muted}>{t.chainOwnerTotal}</span>
                  <div className={`font-bold tabular-nums ${prose}`}>{totalOwners.toLocaleString(locale)}</div>
                </div>
              ) : null}
              {avgAgentsPerOwner !== null ? (
                <div>
                  <span className={muted}>{t.chainAvgAgentsPerOwner}</span>
                  <div className={`font-bold tabular-nums ${prose}`}>{avgAgentsPerOwner.toLocaleString(locale, { maximumFractionDigits: 2 })}</div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {d30 && (
          <div className={`rounded-2xl border px-3 py-2 ${isDark ? 'border-zinc-700 bg-black/15' : 'border-zinc-200 bg-white/60'}`}>
            <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.chainSectionLast30Days}</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
              {pctActive !== null ? (
                <div>
                  <span className={muted}>{t.chainStatPctActive}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{pctActive.toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
                </div>
              ) : null}
              {d30Total !== null ? (
                <div>
                  <span className={muted}>{t.agentsLabel}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{d30Total.toLocaleString(locale)}</div>
                </div>
              ) : null}
              {d30Active !== null ? (
                <div>
                  <span className={muted}>{t.activeLabel}</span>
                  <div className="font-semibold tabular-nums text-emerald-500">{d30Active.toLocaleString(locale)}</div>
                </div>
              ) : null}
              {newAgents30d !== null ? (
                <div>
                  <span className={muted}>{t.chainStatNewAgents30d}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{newAgents30d.toLocaleString(locale)}</div>
                </div>
              ) : null}
              {pctWallet !== null ? (
                <div>
                  <span className={muted}>{t.chainStatPctWalletActivity}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{pctWallet.toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
                </div>
              ) : null}
              {pctOnchain !== null ? (
                <div>
                  <span className={muted}>{t.chainStatPctOnchainActivity}</span>
                  <div className={`font-semibold tabular-nums ${prose}`}>{pctOnchain.toLocaleString(locale, { maximumFractionDigits: 2 })}%</div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <MonthlyAgentsChart rows={chain.statistics_agent_monthly} isDark={isDark} locale={locale} t={t} />

        {humiBarKeys.length > 0 ? (
          <StackedDistributionBar
            title={t.chainChartHumiDistributionTitle}
            rowKeys={humiBarKeys}
            row={humiRow}
            colors={(k) => HUMI_BUCKET_COLORS[k] ?? '#71717a'}
            labelForKey={(k) => {
              const tk = HUMI_BUCKET_TKEY[k];
              return tk ? t[tk] : k;
            }}
            isDark={isDark}
          />
        ) : null}

        {metaBarKeys.length > 0 ? (
          <StackedDistributionBar
            title={t.chainChartMetadataDistributionTitle}
            rowKeys={metaBarKeys}
            row={metaRow}
            colors={(slug) => {
              const dbKey = metaKeysSorted.find((dk) => dk.replace(/\s+/g, '_').replace(/[()]/g, '') === slug);
              const tkey = dbKey ? METADATA_DB_KEY_TO_TKEY[dbKey] : undefined;
              return tkey ? METADATA_BUCKET_COLORS[tkey] ?? '#71717a' : '#71717a';
            }}
            labelForKey={(slug) => {
              const dbKey = metaKeysSorted.find((dk) => dk.replace(/\s+/g, '_').replace(/[()]/g, '') === slug);
              const tkey = dbKey ? METADATA_DB_KEY_TO_TKEY[dbKey] : undefined;
              return tkey ? t[tkey] : slug;
            }}
            isDark={isDark}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

export function DashboardChainCards({ chains, isDark, t, lang }: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';

  if (!chains.length) {
    return (
      <div className={`flex min-h-[120px] items-center justify-center rounded-3xl border p-8 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}>
        <p className={muted}>{t.dashboardChainsEmpty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {chains.map((chain) => (
        <ChainCard key={chain.chain_id} chain={chain} isDark={isDark} t={t} lang={lang} />
      ))}
    </div>
  );
}
