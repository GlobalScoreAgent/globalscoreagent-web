import type { SupabaseClient } from '@supabase/supabase-js';

export type AgentRouteLookupBy = 'id' | 'agent_id';
export type AgentRouteScope = 'dashboard' | 'public';

function pageBase(scope: AgentRouteScope): string {
  return scope === 'public' ? '/agents' : '/dashboard/agents';
}

function apiBase(scope: AgentRouteScope): string {
  return scope === 'public' ? '/api/web-page/agents' : '/api/dashboard/agents';
}

type LookupResult = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
  matchedBy: AgentRouteLookupBy | null;
};

export function parseAgentRouteLookupBy(raw: string | null | undefined): AgentRouteLookupBy {
  return raw === 'agent_id' ? 'agent_id' : 'id';
}

/** Client-side fallback when useSearchParams is empty on first paint. */
export function readAgentRouteLookupBy(fallback: AgentRouteLookupBy = 'id'): AgentRouteLookupBy {
  if (typeof window === 'undefined') return fallback;
  return parseAgentRouteLookupBy(new URLSearchParams(window.location.search).get('by'));
}

export function agentDetailPagePath(
  routeId: string | number,
  lookupBy: AgentRouteLookupBy = 'id',
  scope: AgentRouteScope = 'dashboard',
): string {
  const base = `${pageBase(scope)}/${encodeURIComponent(String(routeId))}`;
  return lookupBy === 'agent_id' ? `${base}?by=agent_id` : base;
}

export function agentDetailApiPath(
  routeId: string | number,
  lookupBy: AgentRouteLookupBy = 'id',
  suffix = '',
  scope: AgentRouteScope = 'dashboard',
): string {
  const base = `${apiBase(scope)}/${encodeURIComponent(String(routeId))}${suffix}`;
  return lookupBy === 'agent_id' ? `${base}?by=agent_id` : base;
}

export function agentDetailSubPagePath(
  routeId: string | number,
  subPath: 'humi' | 'wami',
  lookupBy: AgentRouteLookupBy = 'id',
  scope: AgentRouteScope = 'dashboard',
): string {
  const base = `${pageBase(scope)}/${encodeURIComponent(String(routeId))}/${subPath}`;
  return lookupBy === 'agent_id' ? `${base}?by=agent_id` : base;
}

export const TOP10_AGENTS_LIST_PATH = '/top-10-agents';

export function appendPublicLangParam(href: string, lang: 'es' | 'en'): string {
  if (lang === 'es') return href;
  const qIndex = href.indexOf('?');
  const base = qIndex >= 0 ? href.slice(0, qIndex) : href;
  const query = qIndex >= 0 ? href.slice(qIndex + 1) : '';
  const params = new URLSearchParams(query);
  params.set('lang', 'en');
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function positiveInt(raw: unknown): number | undefined {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.trunc(n);
}

async function queryAgentByColumn(
  supabase: SupabaseClient,
  column: AgentRouteLookupBy,
  numericId: number,
  select: string,
) {
  return supabase
    .schema('web_dashboard')
    .from('agents')
    .select(select)
    .eq(column === 'id' ? 'id' : 'agent_id', numericId)
    .maybeSingle();
}

/** Directory uses agents.id; explicit ?by=agent_id uses erc_8004 agent_id when both match different rows. */
export async function fetchAgentByRouteId(
  supabase: SupabaseClient,
  numericId: number,
  select: string,
  lookupBy: AgentRouteLookupBy = 'id',
): Promise<LookupResult> {
  const [byIdRes, byAgentIdRes] = await Promise.all([
    queryAgentByColumn(supabase, 'id', numericId, select),
    queryAgentByColumn(supabase, 'agent_id', numericId, select),
  ]);

  if (byIdRes.error) {
    return { data: null, error: byIdRes.error, matchedBy: null };
  }
  if (byAgentIdRes.error) {
    return { data: null, error: byAgentIdRes.error, matchedBy: null };
  }

  const byId = byIdRes.data as Record<string, unknown> | null;
  const byAgentId = byAgentIdRes.data as Record<string, unknown> | null;

  if (byId && byAgentId && Number(byId.id) !== Number(byAgentId.id)) {
    const chosen = lookupBy === 'agent_id' ? byAgentId : byId;
    return { data: chosen, error: null, matchedBy: lookupBy };
  }

  if (byId) {
    return { data: byId, error: null, matchedBy: 'id' };
  }

  if (byAgentId) {
    return { data: byAgentId, error: null, matchedBy: 'agent_id' };
  }

  return { data: null, error: null, matchedBy: null };
}

export async function resolveWebAgentPk(
  supabase: SupabaseClient,
  numericId: number,
  lookupBy: AgentRouteLookupBy = 'id',
): Promise<{ webAgentId: number | null; matchedBy: AgentRouteLookupBy | null }> {
  const { data, matchedBy } = await fetchAgentByRouteId(supabase, numericId, 'id', lookupBy);
  if (!data || matchedBy == null || data.id == null) {
    return { webAgentId: null, matchedBy: null };
  }
  return { webAgentId: Number(data.id), matchedBy };
}

export async function resolveTop10WebAgentPk(
  supabase: SupabaseClient,
  listedId: number,
): Promise<number | null> {
  const [byAgentIdRes, byIdRes] = await Promise.all([
    queryAgentByColumn(supabase, 'agent_id', listedId, 'id, agent_id'),
    queryAgentByColumn(supabase, 'id', listedId, 'id, agent_id'),
  ]);

  if (byAgentIdRes.error || byIdRes.error) return null;

  const byAgentId = byAgentIdRes.data as Record<string, unknown> | null;
  const byId = byIdRes.data as Record<string, unknown> | null;

  // HUMI top_10 stores erc_8004 agent_id — must win over accidental id-column collisions.
  if (byAgentId && Number(byAgentId.agent_id) === listedId) {
    return Number(byAgentId.id);
  }

  if (byId && Number(byId.id) === listedId) {
    return Number(byId.id);
  }

  return null;
}

export function parseTop10AgentRoute(
  item: unknown,
): { routeId: number; lookupBy: AgentRouteLookupBy } | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;

  const webAgentId = positiveInt(record.web_agent_id);
  if (webAgentId != null) {
    return { routeId: webAgentId, lookupBy: 'id' };
  }

  const listedId = positiveInt(record.agent_id) ?? positiveInt(record.id);
  if (listedId == null) return null;

  // Unenriched HUMI rows use erc_8004 agent_id; directory always uses web agents.id.
  return { routeId: listedId, lookupBy: 'agent_id' };
}

export async function enrichTop10AgentRows(
  supabase: SupabaseClient,
  raw: unknown,
): Promise<unknown> {
  if (!Array.isArray(raw)) return raw;

  const enriched: unknown[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      enriched.push(item);
      continue;
    }
    const record = item as Record<string, unknown>;
    const listedId = positiveInt(record.agent_id) ?? positiveInt(record.id);
    if (listedId == null) {
      enriched.push(item);
      continue;
    }
    const webAgentId = await resolveTop10WebAgentPk(supabase, listedId);
    if (webAgentId == null) {
      enriched.push(item);
      continue;
    }
    enriched.push({ ...record, web_agent_id: webAgentId });
  }
  return enriched;
}
