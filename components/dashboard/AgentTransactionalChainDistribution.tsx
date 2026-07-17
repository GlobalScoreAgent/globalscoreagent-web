'use client';

import { useId, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { AgentWalletChainActivity } from '@/lib/agentWalletActivity';
import { formatBalanceDisplay } from '@/lib/agentWalletActivity';
import { nativeGasSymbolFromChainName } from '@/lib/agentChains';
import { humanizeWalletCategory } from '@/lib/agentTransactionalWallets';
import {
  getWalletCategoryExplanation,
  type WalletCategoryLang,
} from '@/lib/walletTransactionalCategoryExplanations';
import { chainLogoUrlFromChainName } from '@/lib/chainPublicLogo';
import { cn } from '@/lib/utils';

const PIE_COLORS = [
  '#34d399',
  '#38bdf8',
  '#a78bfa',
  '#fbbf24',
  '#f472b6',
  '#fb923c',
  '#2dd4bf',
  '#818cf8',
];

type Mode = 'nonce' | 'balance';

type Props = {
  mode: Mode;
  chains: AgentWalletChainActivity[];
  isDark: boolean;
  locale: string;
  lang: WalletCategoryLang;
  t: Translations;
  emptyMessage: string;
  onSelectChain: (chainId: number) => void;
};

type PieSlice = {
  chainId: number;
  name: string;
  value: number;
  walletCategory: string | null;
};

function categoryBadgeClass(isDark: boolean) {
  return isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';
}

function ChainCategoryBadge({
  category,
  isDark,
  lang,
  t,
  compact = false,
}: {
  category: string | null;
  isDark: boolean;
  lang: WalletCategoryLang;
  t: Translations;
  compact?: boolean;
}) {
  if (!category) return null;
  const label = humanizeWalletCategory(category);
  const help =
    getWalletCategoryExplanation(category, lang) ??
    t.agentDetailWalletCategoryExplanationFallback;
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-0.5 rounded-full border font-semibold uppercase tracking-wide',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        categoryBadgeClass(isDark),
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="truncate">{label}</span>
      <DashboardInfoTooltip
        content={help}
        ariaLabel={t.agentDetailWalletCategoryInfoAriaLabel}
        isDark={isDark}
        placement="top"
        tooltipClassName="max-w-[16rem] whitespace-normal normal-case"
      />
    </span>
  );
}

function PieTooltip({
  active,
  payload,
  isDark,
  locale,
  total,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number; payload?: PieSlice }>;
  isDark: boolean;
  locale: string;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = entry?.value;
  if (value === undefined || !Number.isFinite(value)) return null;
  const name = entry.payload?.name ?? entry.name ?? '';
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const shareLabel = locale.toLowerCase().startsWith('es') ? 'del total' : 'of total';
  return (
    <div
      className={`min-w-36 rounded-2xl border px-3.5 py-3 text-sm shadow-2xl ${
        isDark
          ? 'border-emerald-400/30 bg-zinc-950 text-zinc-100'
          : 'border-emerald-600/20 bg-white text-zinc-900'
      }`}
    >
      <div className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {name}
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums">
        {Math.round(value).toLocaleString(locale, { maximumFractionDigits: 0 })}
      </div>
      <div className={cn('mt-0.5 text-xs tabular-nums', isDark ? 'text-emerald-300' : 'text-emerald-700')}>
        {percentage.toLocaleString(locale, { maximumFractionDigits: 1 })}% {shareLabel}
      </div>
    </div>
  );
}

export function AgentTransactionalChainDistribution({
  mode,
  chains,
  isDark,
  locale,
  lang,
  t,
  emptyMessage,
  onSelectChain,
}: Props) {
  const gradientId = useId().replace(/:/g, '');
  const [hoveredChainId, setHoveredChainId] = useState<number | null>(null);
  const pieData = useMemo(() => {
    const slices: PieSlice[] = [];
    for (const chain of chains) {
      const v = chain.nonce_current;
      if (v === null || !Number.isFinite(v) || v <= 0) continue;
      slices.push({
        chainId: chain.chain_id,
        name: chain.chain_name,
        value: v,
        walletCategory: chain.wallet_category,
      });
    }
    return slices.sort((a, b) => b.value - a.value);
  }, [chains]);

  const totalNonce = useMemo(
    () => pieData.reduce((sum, s) => sum + s.value, 0),
    [pieData],
  );

  const balanceRows = useMemo(() => {
    return [...chains].sort((a, b) => {
      const ba = a.balance_current ?? -1;
      const bb = b.balance_current ?? -1;
      return bb - ba;
    });
  }, [chains]);

  if (chains.length === 0) {
    return (
      <div
        className={`flex h-full items-center justify-center text-sm ${
          isDark ? 'text-gray-500' : 'text-zinc-500'
        }`}
      >
        {emptyMessage}
      </div>
    );
  }

  if (mode === 'nonce') {
    if (pieData.length === 0 || totalNonce <= 0) {
      return (
        <div
          className={`flex h-full items-center justify-center text-sm ${
            isDark ? 'text-gray-500' : 'text-zinc-500'
          }`}
        >
          {emptyMessage}
        </div>
      );
    }

    const isSpanish = locale.toLowerCase().startsWith('es');
    const totalLabel = isSpanish ? 'Nonce total' : 'Total nonce';
    const chainsLabel = isSpanish ? 'redes' : 'chains';

    return (
      <div className="flex h-full min-h-0 flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={cn(
            'relative h-48 min-h-0 w-full flex-1 overflow-hidden rounded-2xl border sm:h-full',
            isDark
              ? 'border-emerald-400/10 bg-gradient-to-br from-emerald-500/[0.07] via-zinc-950/20 to-sky-500/[0.05]'
              : 'border-emerald-600/10 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/70',
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {pieData.map((slice, i) => {
                  const color = PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <linearGradient
                      key={slice.chainId}
                      id={`${gradientId}-${slice.chainId}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.62} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="53%"
                outerRadius="78%"
                cornerRadius={7}
                paddingAngle={3}
                stroke={isDark ? '#18181b' : '#ffffff'}
                strokeWidth={2}
              >
                {pieData.map((slice, i) => (
                  <Cell
                    key={slice.chainId}
                    fill={`url(#${gradientId}-${slice.chainId})`}
                    className="outline-none cursor-pointer"
                    opacity={
                      hoveredChainId === null || hoveredChainId === slice.chainId ? 1 : 0.42
                    }
                    style={{
                      cursor: 'pointer',
                      filter:
                        hoveredChainId === slice.chainId
                          ? `drop-shadow(0 0 6px ${PIE_COLORS[i % PIE_COLORS.length]}66)`
                          : undefined,
                      transition: 'opacity 180ms ease, filter 180ms ease',
                    }}
                    onMouseEnter={() => setHoveredChainId(slice.chainId)}
                    onMouseLeave={() => setHoveredChainId(null)}
                    onClick={() => onSelectChain(slice.chainId)}
                  />
                ))}
              </Pie>
              <Tooltip
                content={(props) => (
                  <PieTooltip
                    active={props.active}
                    payload={
                      props.payload as unknown as
                        | ReadonlyArray<{ name?: string; value?: number; payload?: PieSlice }>
                        | undefined
                    }
                    isDark={isDark}
                    locale={locale}
                    total={totalNonce}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div
            className={cn(
              'pointer-events-none absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-150',
              hoveredChainId !== null ? 'opacity-0' : 'opacity-100',
            )}
          >
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.14em]',
                isDark ? 'text-zinc-500' : 'text-zinc-500',
              )}
            >
              {totalLabel}
            </span>
            <span
              className={cn(
                'mt-1 max-w-28 truncate text-2xl font-bold tabular-nums',
                isDark ? 'text-zinc-50' : 'text-zinc-900',
              )}
              title={Math.round(totalNonce).toLocaleString(locale)}
            >
              {new Intl.NumberFormat(locale, {
                notation: totalNonce >= 10_000 ? 'compact' : 'standard',
                maximumFractionDigits: totalNonce >= 10_000 ? 1 : 0,
              }).format(totalNonce)}
            </span>
            <span className={cn('mt-0.5 text-[10px]', isDark ? 'text-emerald-400/80' : 'text-emerald-700')}>
              {pieData.length} {chainsLabel}
            </span>
          </div>
        </div>
        <ul className="flex max-h-full w-full shrink-0 flex-col gap-2 overflow-y-auto pr-0.5 sm:w-60">
          {pieData.map((slice, i) => {
            const pct = totalNonce > 0 ? (slice.value / totalNonce) * 100 : 0;
            const logoSrc = chainLogoUrlFromChainName(slice.name);
            return (
              <li key={slice.chainId}>
                <button
                  type="button"
                  onClick={() => onSelectChain(slice.chainId)}
                  onMouseEnter={() => setHoveredChainId(slice.chainId)}
                  onMouseLeave={() => setHoveredChainId(null)}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all',
                    hoveredChainId === slice.chainId
                      ? isDark
                        ? 'border-emerald-400/25 bg-emerald-400/[0.08]'
                        : 'border-emerald-600/20 bg-emerald-50'
                      : isDark
                        ? 'border-zinc-700/40 bg-zinc-950/25 hover:border-zinc-600'
                        : 'border-zinc-200/70 bg-white/60 hover:border-zinc-300',
                  )}
                >
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 p-1 shadow-sm">
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoSrc} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-600">
                        {slice.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span
                      className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{slice.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={cn('text-[10px] tabular-nums', isDark ? 'text-zinc-500' : 'text-zinc-500')}>
                        {Math.round(slice.value).toLocaleString(locale)}
                      </span>
                      <ChainCategoryBadge
                        category={slice.walletCategory}
                        isDark={isDark}
                        lang={lang}
                        t={t}
                        compact
                      />
                    </span>
                  </span>
                  <span className={cn('shrink-0 text-xs font-semibold tabular-nums', isDark ? 'text-emerald-300' : 'text-emerald-700')}>
                    {pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <ul className="flex h-full flex-col gap-1 overflow-y-auto">
      {balanceRows.map((chain) => {
        const logoSrc = chainLogoUrlFromChainName(chain.chain_name);
        const total = formatBalanceDisplay(
          chain.balance_current,
          locale,
          nativeGasSymbolFromChainName(chain.chain_name),
        );
        return (
          <li key={chain.chain_id}>
            <button
              type="button"
              onClick={() => onSelectChain(chain.chain_id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                isDark
                  ? 'border-zinc-700/55 bg-zinc-950/40 hover:bg-zinc-900/80'
                  : 'border-zinc-200/80 bg-zinc-50/80 hover:bg-zinc-100',
              )}
            >
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                />
              ) : (
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                    isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-200 text-zinc-600',
                  )}
                >
                  {chain.chain_name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{chain.chain_name}</span>
                {chain.wallet_category ? (
                  <span className="mt-1 block">
                    <ChainCategoryBadge
                      category={chain.wallet_category}
                      isDark={isDark}
                      lang={lang}
                      t={t}
                      compact
                    />
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {total ?? '—'}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
