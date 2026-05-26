'use client';

import Link from 'next/link';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { getHumiScoreColor } from '@/lib/agentHumiDisplay';
import { cn } from '@/lib/utils';
import {
  humiFilterFromNumericScore,
  type Best10AgentHumiRow,
} from '@/lib/dashboardChains';

type Props = {
  agents: Best10AgentHumiRow[];
  isDark: boolean;
  t: Translations;
  locale: string;
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

function Top10LeaderboardRow({
  rank,
  name,
  scoreText,
  tier,
  isDark,
  agentId,
}: {
  rank: number;
  name: string;
  scoreText: string;
  tier: string;
  isDark: boolean;
  agentId?: number;
}) {
  const scoreColor = getHumiScoreColor(tier);
  const stripeBorder = isDark ? 'border-zinc-700/80 bg-black/20' : 'border-zinc-200 bg-white/70';

  const rowContent = (
    <>
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
          rankBadgeClass(rank, isDark),
        )}
      >
        {rank}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs',
          rank <= 3 && 'font-bold',
          isDark ? 'text-white' : 'text-zinc-900',
        )}
        title={name}
      >
        {name}
      </span>
      <span
        className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
        style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
      >
        {scoreText}
      </span>
    </>
  );

  const rowClassName = cn(
    'flex min-w-0 w-full items-center gap-2 rounded-lg border border-l-[3px] px-2 py-1.5',
    stripeBorder,
    agentId != null && 'transition-colors',
    agentId != null && (isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'),
  );

  if (agentId != null) {
    return (
      <li className="min-w-0">
        <Link
          href={`/dashboard/agents/${agentId}`}
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

export function ChainTopAgentsList({ agents, isDark, t, locale, className, style }: Props) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const shell = isDark ? 'border-zinc-700 bg-black/15' : 'border-zinc-200 bg-white/60';

  return (
    <div className={cn('flex min-h-0 flex-col rounded-2xl border px-3 py-2', shell, className)} style={style}>
      <p className={`mb-2 shrink-0 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
        {t.chainTop10HumiTitle}
      </p>
      {agents.length === 0 ? (
        <p className={`text-xs ${muted}`}>{t.chainTop10HumiEmpty}</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2.5 [scrollbar-gutter:stable]">
          <ol className="grid grid-cols-1 gap-2">
            {agents.map((agent, index) => {
              const tier = humiFilterFromNumericScore(agent.humi_score);
              const scoreText = agent.humi_score.toLocaleString(locale, {
                maximumFractionDigits: 2,
              });
              return (
                <Top10LeaderboardRow
                  key={agent.agent_id ?? `${index}-${agent.name}`}
                  rank={index + 1}
                  name={agent.name}
                  scoreText={scoreText}
                  tier={tier}
                  isDark={isDark}
                  agentId={agent.agent_id}
                />
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
