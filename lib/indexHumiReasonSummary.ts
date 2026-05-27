import type { PillarSummaryItemReason } from '@/lib/indexHumiPillarSummary';

type Lang = 'es' | 'en';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function formatValue(v: unknown, lang: Lang): string {
  if (v === null || v === undefined) return lang === 'es' ? 'sin dato' : 'no data';
  if (typeof v === 'boolean') return v ? (lang === 'es' ? 'sí' : 'yes') : lang === 'es' ? 'no' : 'no';
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 });
  }
  if (typeof v === 'string') return v.trim() || (lang === 'es' ? 'sin dato' : 'no data');
  if (Array.isArray(v)) return `${v.length} ${lang === 'es' ? 'elementos' : 'items'}`;
  return lang === 'es' ? 'ver detalle' : 'see details';
}

const KEY_LABELS: Record<string, { es: string; en: string }> = {
  reason: { es: 'Motivo', en: 'Reason' },
  active_agents_in_portfolio: { es: 'Agentes activos en cartera', en: 'Active agents in portfolio' },
  has_active_wallet_in_chain_info: { es: 'Wallet activa on-chain', en: 'Active wallet on-chain' },
  is_stable: { es: 'Estable', en: 'Stable' },
  owner_changes: { es: 'Cambios de propietario', en: 'Owner changes' },
  agent_age_months: { es: 'Antigüedad del agente (meses)', en: 'Agent age (months)' },
  days_since_first_tx: { es: 'Días desde primera tx', en: 'Days since first tx' },
  total_agents: { es: 'Total agentes', en: 'Total agents' },
  active_agents: { es: 'Agentes activos', en: 'Active agents' },
  percentage_active: { es: '% activos', en: '% active' },
  has_at_least_one: { es: 'Tiene al menos uno', en: 'Has at least one' },
  total_audited_agents: { es: 'Agentes auditados', en: 'Audited agents' },
  warnings_pct: { es: '% advertencias', en: '% warnings' },
  total_warnings: { es: 'Total advertencias', en: 'Total warnings' },
  total_active_agents: { es: 'Total agentes activos', en: 'Total active agents' },
  services_pct: { es: '% servicios', en: '% services' },
  metadata_points: { es: 'Puntos metadata', en: 'Metadata points' },
  services_points: { es: 'Puntos servicios', en: 'Services points' },
  metadata_avg_score: { es: 'Score medio metadata', en: 'Avg metadata score' },
  services_with_at_least_one: { es: 'Servicios con al menos uno', en: 'Services with at least one' },
  coverage_pct: { es: '% cobertura', en: '% coverage' },
  total_audited: { es: 'Total auditados', en: 'Total audited' },
  good_excellent_pct: { es: '% bueno/excelente', en: '% good/excellent' },
  activity_pct: { es: '% actividad', en: '% activity' },
  total_activity: { es: 'Actividad total', en: 'Total activity' },
  score: { es: 'Score', en: 'Score' },
  age_days: { es: 'Días de antigüedad', en: 'Age (days)' },
  nonce_current: { es: 'Nonce actual', en: 'Current nonce' },
  nonce_yesterday: { es: 'Nonce ayer', en: 'Yesterday nonce' },
  avg_score: { es: 'Score medio', en: 'Avg score' },
  active_types: { es: 'Tipos activos', en: 'Active types' },
  protocol_30d: { es: 'Protocolo (30d)', en: 'Protocol (30d)' },
  with_payments: { es: 'Con pagos', en: 'With payments' },
  value: { es: 'Valor', en: 'Value' },
  nonce_used: { es: 'Nonce usado', en: 'Nonce used' },
  revoke: { es: 'Revocados', en: 'Revoked' },
  comments_30d: { es: 'Comentarios (30d)', en: 'Comments (30d)' },
  total_score: { es: 'Score total', en: 'Total score' },
  has_audit: { es: 'Tiene auditoría', en: 'Has audit' },
  has_identity: { es: 'Tiene identidad', en: 'Has identity' },
  has_protocol: { es: 'Tiene protocolo', en: 'Has protocol' },
  wallet_basic: { es: 'Wallet básica', en: 'Basic wallet' },
  onchain_basic: { es: 'On-chain básico', en: 'Basic on-chain' },
  audits_count: { es: 'Cantidad auditorías', en: 'Audits count' },
  has_external_audit: { es: 'Auditoría externa', en: 'External audit' },
  nonce_delta_6month: { es: 'Delta nonce 6 meses', en: 'Nonce delta 6 months' },
  activities_count: { es: 'Actividades', en: 'Activities count' },
  has_protocol_activity: { es: 'Actividad de protocolo', en: 'Protocol activity' },
  nonce_used_field: { es: 'Campo nonce', en: 'Nonce field' },
  has_mcp: { es: 'Tiene MCP', en: 'Has MCP' },
  has_a2a: { es: 'Tiene A2A', en: 'Has A2A' },
  advanced_tech_count: { es: 'Tecnologías avanzadas', en: 'Advanced tech count' },
  ext_sources_count: { es: 'Fuentes externas', en: 'External sources' },
  has_web_email: { es: 'Web o email', en: 'Web or email' },
  has_programmatic: { es: 'API programática', en: 'Programmatic API' },
  has_supported_trust: { es: 'Trust soportado', en: 'Supported trust' },
  has_verification: { es: 'Verificación', en: 'Verification' },
  fields_count: { es: 'Campos técnicos', en: 'Technical fields' },
};

function labelForKey(key: string, lang: Lang): string {
  const entry = KEY_LABELS[key];
  if (entry) return lang === 'es' ? entry.es : entry.en;
  return key.replace(/_/g, ' ');
}

function flattenReasonEntries(
  obj: Record<string, unknown>,
  lang: Lang,
  maxParts: number,
): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (parts.length >= maxParts) break;
    if (key === 'layers' && isPlainObject(value)) {
      const layerScore = value.total_score ?? value.basic_score;
      if (layerScore !== undefined) {
        parts.push(
          `${lang === 'es' ? 'Capas metadata' : 'Metadata layers'}: ${formatValue(layerScore, lang)}`,
        );
      }
      continue;
    }
    if (key === 'sources' && isPlainObject(value)) {
      const count = Object.values(value).filter((v) => Number(v) > 0).length;
      parts.push(`${labelForKey('ext_sources_count', lang)}: ${count}`);
      continue;
    }
    if (isPlainObject(value)) {
      const nested = flattenReasonEntries(value, lang, 1);
      if (nested[0]) parts.push(`${labelForKey(key, lang)}: ${nested[0]}`);
      continue;
    }
    parts.push(`${labelForKey(key, lang)}: ${formatValue(value, lang)}`);
  }
  return parts;
}

/**
 * Builds a short human-readable summary from a pillar summary item reason object.
 */
export function formatPillarSummaryReasonShort(
  reason: PillarSummaryItemReason | null | undefined,
  lang: Lang,
  emptyLabel: string,
): string {
  if (!reason || !isPlainObject(reason)) return emptyLabel;

  const direct = reason.reason;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const parts = flattenReasonEntries(reason, lang, 3);
  if (parts.length === 0) return emptyLabel;
  return parts.join(' · ');
}
