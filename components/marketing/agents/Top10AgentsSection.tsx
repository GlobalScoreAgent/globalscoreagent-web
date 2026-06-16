'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { agentDetailPagePath, appendPublicLangParam } from '@/lib/dashboardAgentLookup';
import type { PublicTop10AgentRow } from '@/lib/web-page/top-agents';
import Top10AgentsList from './Top10AgentsList';

type LoadState = 'loading' | 'ready' | 'error';

export default function Top10AgentsSection() {
  const { language } = useLanguage();
  const copy = marketingCopy.top10Agents;
  const [agents, setAgents] = useState<PublicTop10AgentRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadState('loading');
      try {
        const res = await fetch('/api/web-page/top-agents');
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !body?.success || !Array.isArray(body.data)) {
          setAgents([]);
          setLoadState('error');
          return;
        }
        setAgents(body.data as PublicTop10AgentRow[]);
        setLoadState('ready');
      } catch {
        if (!cancelled) {
          setAgents([]);
          setLoadState('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const locale = language === 'es' ? 'es-ES' : 'en-US';

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          {pick(language, copy.title)}
        </h1>
        <p className="mx-auto max-w-2xl text-zinc-400">{pick(language, copy.subtitle)}</p>
      </header>

      {loadState === 'loading' ? (
        <p className="text-center text-sm text-zinc-500">{pick(language, copy.loading)}</p>
      ) : loadState === 'error' || agents.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">{pick(language, copy.empty)}</p>
      ) : (
        <Top10AgentsList
          agents={agents}
          locale={locale}
          humiScoreLabel={pick(language, copy.humiScoreLabel)}
          getAgentHref={(agent) =>
            appendPublicLangParam(
              agentDetailPagePath(agent.agent_id, 'agent_id', 'public'),
              language,
            )
          }
        />
      )}
    </section>
  );
}
