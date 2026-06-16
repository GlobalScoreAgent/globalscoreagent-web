import {
  WARNING_STAT_KEYS,
  type WarningStatKey,
} from '@/lib/dashboardChains';

export type AgentWarningSeverity = 'high' | 'medium';

export type AgentWarningType = WarningStatKey;

export type AgentWarningEntry = {
  type: AgentWarningType;
  severity: AgentWarningSeverity;
  score_impact: number;
  message: string;
  details: Record<string, unknown>;
};

export type AgentWarningHelpTranslationKey =
  | 'agentDetailWarningDuplicationMetadataHelp'
  | 'agentDetailWarningMultiAgentWalletHelp'
  | 'agentDetailWarningDummyMetadataHelp'
  | 'agentDetailWarningAttestationsSpamHelp'
  | 'agentDetailWarningExternalAuditWarningHelp'
  | 'agentDetailWarningHighRevocationsHelp'
  | 'agentDetailWarningOwnerInactiveAgentsHelp'
  | 'agentDetailWarningHighOwnershipChurnHelp'
  | 'agentDetailWarningTransactionalWalletSameAsOwnerHelp'
  | 'agentDetailWarningLowerRealnessHelp'
  | 'agentDetailWarningLowerMetadataRichnessHelp';

export const AGENT_WARNING_HELP_TKEY: Record<
  WarningStatKey,
  AgentWarningHelpTranslationKey
> = {
  duplication_metadata: 'agentDetailWarningDuplicationMetadataHelp',
  multi_agent_wallet: 'agentDetailWarningMultiAgentWalletHelp',
  dummy_metadata: 'agentDetailWarningDummyMetadataHelp',
  attestations_spam: 'agentDetailWarningAttestationsSpamHelp',
  external_audit_warning: 'agentDetailWarningExternalAuditWarningHelp',
  high_revocations: 'agentDetailWarningHighRevocationsHelp',
  owner_inactive_agents: 'agentDetailWarningOwnerInactiveAgentsHelp',
  high_ownership_churn: 'agentDetailWarningHighOwnershipChurnHelp',
  transactional_wallet_same_as_owner:
    'agentDetailWarningTransactionalWalletSameAsOwnerHelp',
  lower_realness: 'agentDetailWarningLowerRealnessHelp',
  lower_metadata_richness: 'agentDetailWarningLowerMetadataRichnessHelp',
};

const WARNING_TYPE_SET = new Set<string>(WARNING_STAT_KEYS);

function isWarningType(v: unknown): v is WarningStatKey {
  return typeof v === 'string' && WARNING_TYPE_SET.has(v);
}

function isSeverity(v: unknown): v is AgentWarningSeverity {
  return v === 'high' || v === 'medium';
}

function parseEntry(raw: unknown): AgentWarningEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!isWarningType(o.type) || !isSeverity(o.severity)) return null;

  const scoreRaw = o.score_impact;
  const scoreImpact =
    typeof scoreRaw === 'number' ? scoreRaw : Number(scoreRaw);
  if (!Number.isFinite(scoreImpact)) return null;

  const message = typeof o.message === 'string' ? o.message.trim() : '';
  if (!message) return null;

  const details =
    o.details && typeof o.details === 'object' && !Array.isArray(o.details)
      ? (o.details as Record<string, unknown>)
      : {};

  return {
    type: o.type,
    severity: o.severity,
    score_impact: scoreImpact,
    message,
    details,
  };
}

export function parseAgentWarnings(raw: unknown): AgentWarningEntry[] {
  if (!Array.isArray(raw)) return [];

  const byType = new Map<WarningStatKey, AgentWarningEntry>();
  for (const item of raw) {
    const entry = parseEntry(item);
    if (entry) byType.set(entry.type, entry);
  }

  return WARNING_STAT_KEYS.flatMap((key) => {
    const entry = byType.get(key);
    return entry ? [entry] : [];
  });
}

export function worstAgentWarningSeverity(
  warnings: AgentWarningEntry[],
): AgentWarningSeverity | null {
  if (warnings.some((w) => w.severity === 'high')) return 'high';
  if (warnings.some((w) => w.severity === 'medium')) return 'medium';
  return null;
}
