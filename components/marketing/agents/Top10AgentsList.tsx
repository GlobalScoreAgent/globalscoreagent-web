'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getHumiScoreColor } from '@/lib/agentHumiDisplay';
import { humiFilterFromNumericScore } from '@/lib/dashboardChains';
import { chainLogoBasenameFromChainName, publicChainLogoUrl } from '@/lib/chainPublicLogo';
import type { PublicTop10AgentRow } from '@/lib/web-page/top-agents';
import { cn } from '@/lib/utils';

const AGENT_IMAGE_DEFAULT = '/agent_directory_default.jpg';

type Props = {
  agents: PublicTop10AgentRow[];
  locale: string;
  humiScoreLabel: string;
  getAgentHref: (agent: PublicTop10AgentRow) => string;
};

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/40';
  if (rank === 2) return 'bg-zinc-500/25 text-zinc-200 ring-1 ring-zinc-400/40';
  if (rank === 3) return 'bg-orange-600/25 text-orange-300 ring-1 ring-orange-500/40';
  return 'bg-zinc-800/80 text-zinc-400';
}

function Top10AgentCard({
  agent,
  rank,
  locale,
  humiScoreLabel,
  href,
}: {
  agent: PublicTop10AgentRow;
  rank: number;
  locale: string;
  humiScoreLabel: string;
  href: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [chainLogoFailed, setChainLogoFailed] = useState(false);

  const tier = humiFilterFromNumericScore(agent.index_humi_score);
  const scoreColor = getHumiScoreColor(tier);
  const scoreText = agent.index_humi_score.toLocaleString(locale, { maximumFractionDigits: 2 });

  const imageSrc =
    !agent.image_url || imgFailed ? AGENT_IMAGE_DEFAULT : agent.image_url;

  const chainLogoSrc = publicChainLogoUrl(
    chainLogoBasenameFromChainName(agent.chain_short_name),
  );

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'group flex gap-4 rounded-2xl border border-gold/15 bg-black/30 p-4 ring-1 ring-inset ring-white/5',
          'transition-colors hover:border-gold/30 hover:bg-black/40',
        )}
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
            rankBadgeClass(rank),
          )}
        >
          {rank}
        </span>

        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <Image
            src={imageSrc}
            alt={agent.name}
            fill
            className="object-contain p-1"
            sizes="64px"
            unoptimized
            onError={() => setImgFailed(true)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-white group-hover:text-gold">
              {agent.name}
            </h2>
            {agent.chain_short_name ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-400">
                {chainLogoSrc && !chainLogoFailed ? (
                  <Image
                    src={chainLogoSrc}
                    alt=""
                    width={14}
                    height={14}
                    className="rounded-sm object-contain"
                    unoptimized
                    onError={() => setChainLogoFailed(true)}
                  />
                ) : null}
                {agent.chain_short_name}
              </span>
            ) : null}
            <span
              className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
              style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
              title={humiScoreLabel}
            >
              {scoreText}
            </span>
          </div>
          {agent.description ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{agent.description}</p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

export default function Top10AgentsList({ agents, locale, humiScoreLabel, getAgentHref }: Props) {
  return (
    <ol className="space-y-4">
      {agents.map((agent, index) => (
        <Top10AgentCard
          key={agent.agent_id}
          agent={agent}
          rank={index + 1}
          locale={locale}
          humiScoreLabel={humiScoreLabel}
          href={getAgentHref(agent)}
        />
      ))}
    </ol>
  );
}
