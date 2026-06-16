'use client';

import Link from 'next/link';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { getHumiScoreColor } from '@/lib/agentHumiDisplay';
import { agentDetailPagePath } from '@/lib/dashboardAgentLookup';
import { cn } from '@/lib/utils';
import {
  humiFilterFromNumericScore,
  type Best10AgentHumiRow,
} from '@/lib/dashboardChains';

type ListDensity = 'default' | 'compact' | 'overview';

type Props = {
  agents: Best10AgentHumiRow[];
  isDark: boolean;
  t: Translations;
  locale: string;
  title?: string;
  showTitle?: boolean;
  density?: ListDensity;
  className?: string;
  style?: React.CSSProperties;
};

function rankBadgeClass(rank: number, isDark: boolean): string {
  if (rank === 1) {
    return isDark
      ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/40'
      : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300/80';
  }
  if (rank === 2) {
    return isDark
      ? 'bg-zinc-500/25 text-zinc-200 ring-1 ring-zinc-400/40'
      : 'bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300';
  }
  if (rank === 3) {
    return isDark
      ? 'bg-orange-600/25 text-orange-300 ring-1 ring-orange-500/40'
      : 'bg-orange-100 text-orange-800 ring-1 ring-orange-300/80';
  }
  return isDark ? 'bg-zinc-800/80 text-zinc-400' : 'bg-zinc-100 text-zinc-600';
}

function rankBadgeSizeClass(density: ListDensity): string {
  if (density === 'compact') return 'h-4 w-4 text-[9px]';
  if (density === 'overview') return 'h-5 w-5 text-[10px]';
  return 'h-5 w-5 text-[10px]';
}

function nameSizeClass(density: ListDensity, isDark: boolean): string {
  return cn(
    'min-w-0 truncate',
    density === 'compact' ? 'text-[10px]' : density === 'overview' ? 'text-xs' : 'text-xs',
    isDark ? 'text-white' : 'text-zinc-900',
  );
}

function chainSizeClass(density: ListDensity, isDark: boolean): string {
  return cn(
    'shrink-0 font-normal',
    density === 'compact' ? 'text-[9px]' : density === 'overview' ? 'text-[10px]' : 'text-xs',
    isDark ? 'text-zinc-500' : 'text-zinc-400',
  );
}

function scoreSizeClass(density: ListDensity): string {
  if (density === 'compact') return 'px-1 py-0 text-[9px]';
  if (density === 'overview') return 'px-1.5 py-0.5 text-[10px]';
  return 'px-1.5 py-0.5 text-[10px]';
}

function rowLayoutClass(density: ListDensity): string {
  if (density === 'compact') return 'gap-1 px-1.5 py-0.5';
  if (density === 'overview') return 'gap-1 px-2 py-1';
  return 'gap-2 px-2 py-1.5';
}

function listGapClass(density: ListDensity): string {
  if (density === 'compact') return 'gap-0.5';
  if (density === 'overview') return 'gap-1';
  return 'gap-2';
}

function Top10LeaderboardRow({
  rank,
  name,
  chainShortName,
  scoreText,
  tier,
  isDark,
  agentId,
  routeLookupBy = 'id',
  density = 'default',
}: {
  rank: number;
  name: string;
  chainShortName?: string;
  scoreText: string;
  tier: string;
  isDark: boolean;
  agentId?: number;
  routeLookupBy?: import('@/lib/dashboardAgentLookup').AgentRouteLookupBy;
  density?: ListDensity;
}) {
  const scoreColor = getHumiScoreColor(tier);
  const stripeBorder = isDark ? 'border-zinc-700/80 bg-black/20' : 'border-zinc-200 bg-white/70';
  const displayTitle = chainShortName ? `${name} (${chainShortName})` : name;

  const rowContent = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums',
          rankBadgeSizeClass(density),
          rankBadgeClass(rank, isDark),
        )}
      >
        {rank}
      </span>
      <span
        className={cn(
          'flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden',
          rank <= 3 && 'font-bold',
        )}
        title={displayTitle}
      >
        <span className={nameSizeClass(density, isDark)}>{name}</span>
        {chainShortName ? (
          <span className={chainSizeClass(density, isDark)}>({chainShortName})</span>
        ) : null}
      </span>
      <span
        className={cn('shrink-0 rounded-full font-bold tabular-nums', scoreSizeClass(density))}
        style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
      >
        {scoreText}
      </span>
    </>
  );

  const rowClassName = cn(
    'flex min-w-0 w-full items-center rounded-lg border border-l-[3px]',
    rowLayoutClass(density),
    stripeBorder,
    agentId != null && 'transition-colors',
    agentId != null && (isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'),
  );

  if (agentId != null) {
    return (
      <li className="min-w-0">
        <Link
          href={agentDetailPagePath(agentId, routeLookupBy)}
          className={cn(
            rowClassName,
            'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60',
          )}
          style={{ borderLeftColor: scoreColor }}
        >
          {rowContent}
        </Link>
      </li>
    );
  }

  return (
    <li className={rowClassName} style={{ borderLeftColor: scoreColor }}>
      {rowContent}
    </li>
  );
}

export function ChainTopAgentsList({
  agents,
  isDark,
  t,
  locale,
  title,
  showTitle = true,
  density = 'default',
  className,
  style,
}: Props) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const shell = isDark ? 'border-zinc-700 bg-black/15' : 'border-zinc-200 bg-white/60';
  const listTitle = title ?? t.chainTop10HumiTitle;

  return (
    <div className={cn('flex min-h-0 flex-col rounded-2xl border px-3 py-2', shell, className)} style={style}>
      {showTitle ? (
        <p className={`mb-2 shrink-0 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
          {listTitle}
        </p>
      ) : null}
      {agents.length === 0 ? (
        <p className={`text-xs ${muted}`}>{t.chainTop10HumiEmpty}</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2.5 [scrollbar-gutter:stable]">
          <ol className={cn('grid grid-cols-1', listGapClass(density))}>
            {agents.map((agent, index) => {
              const tier = humiFilterFromNumericScore(agent.humi_score);
              const scoreText = agent.humi_score.toLocaleString(locale, {
                maximumFractionDigits: 2,
              });
              const routeLookupBy = agent.route_lookup_by ?? 'id';
              return (
                <Top10LeaderboardRow
                  key={agent.agent_id ?? `${index}-${agent.name}`}
                  rank={index + 1}
                  name={agent.name}
                  chainShortName={agent.chain_short_name}
                  scoreText={scoreText}
                  tier={tier}
                  isDark={isDark}
                  agentId={agent.agent_id}
                  routeLookupBy={routeLookupBy}
                  density={density}
                />
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
