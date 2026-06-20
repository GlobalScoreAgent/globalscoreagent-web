import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { ChainDistributionSlide } from '@/components/dashboard/ChainDistributionPanel';
import {
  METADATA_BUCKET_COLORS,
  METADATA_ORDER,
  METADATA_TKEY,
  MATURITY_COLORS,
  MATURITY_ORDER,
  MATURITY_TKEY,
  chainAccentColor,
  chainAccentHex,
  normalizeMaturityDistribution,
  normalizeMetadataDistribution,
  numFromJson,
  parseBest10AgentsHumi,
  parseTechnicalMaturityPcts,
  parseWarningStats,
  type Best10AgentHumiRow,
  type DashboardChainRow,
} from '@/lib/dashboardChains';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';

export type ChainCardData = {
  chain: DashboardChainRow;
  locale: string;
  accent: string;
  accentHex: string;
  logoSrc: string | null;
  totalAgents: number | null;
  activeAgents: number | null;
  withFeedback: number | null;
  totalOwners: number | null;
  avgAgentsPerOwner: number | null;
  pctActive: number | null;
  d30Total: number | null;
  d30Active: number | null;
  newAgents30d: number | null;
  pctWallet: number | null;
  pctOnchain: number | null;
  pctX402: number | null;
  pctMcpA2a: number | null;
  countX402: number | null;
  countMcpA2a: number | null;
  onChainExec: number | null;
  onChainPay: number | null;
  onChainProto: number | null;
  showLast30Section: boolean;
  warningStats: ReturnType<typeof parseWarningStats>;
  topAgents: Best10AgentHumiRow[];
  distributionSlides: ChainDistributionSlide[];
};

export function formatChainUpdatedAt(iso: string | null | undefined, locale: string): string {
  if (iso == null || iso === '') return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function buildChainCardData(
  chain: DashboardChainRow,
  lang: 'es' | 'en',
  t: Translations,
): ChainCardData {
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
  const { pctX402, pctMcpA2a, countX402, countMcpA2a } = parseTechnicalMaturityPcts(techJson, totalAgents);

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

  const distributionSlides: ChainDistributionSlide[] = [];
  if (humiBarKeys.length > 0) {
    distributionSlides.push({
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
  if (wamiBarKeys.length > 0) {
    distributionSlides.push({
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
  if (metaBarKeys.length > 0) {
    distributionSlides.push({
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

  return {
    chain,
    locale,
    accent,
    accentHex,
    logoSrc,
    totalAgents,
    activeAgents,
    withFeedback,
    totalOwners,
    avgAgentsPerOwner,
    pctActive,
    d30Total,
    d30Active,
    newAgents30d,
    pctWallet,
    pctOnchain,
    pctX402,
    pctMcpA2a,
    countX402,
    countMcpA2a,
    onChainExec,
    onChainPay,
    onChainProto,
    showLast30Section: hasLast30Legacy || hasLast30OnChain,
    warningStats: parseWarningStats(chain.warning_stats_information, totalAgents),
    topAgents: parseBest10AgentsHumi(chain.best_10_agents_humi),
    distributionSlides,
  };
}

export function fmtChainPct(n: number | null, locale: string): string {
  return n === null || !Number.isFinite(n) ? '—' : `${n.toLocaleString(locale, { maximumFractionDigits: 2 })}%`;
}

export function fmtChainCount(n: number | null, locale: string): string {
  return n === null || !Number.isFinite(n) ? '—' : Number(n).toLocaleString(locale, { maximumFractionDigits: 0 });
}
