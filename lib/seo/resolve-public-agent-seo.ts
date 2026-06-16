import {
  fetchAgentByRouteId,
  parseAgentRouteLookupBy,
  type AgentRouteLookupBy,
} from '@/lib/dashboardAgentLookup';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import {
  buildPublicAgentMetadata,
  type PublicAgentSeoView,
} from '@/lib/seo/public-agent-metadata';
import type { SeoLang } from '@/content/marketing/metadata';
import type { Metadata } from 'next';

const AGENT_SEO_SELECT = 'name, description, image_url';

export async function resolvePublicAgentMetadata(
  idParam: string,
  lookupByRaw: string | string[] | undefined,
  view: PublicAgentSeoView,
  lang: SeoLang,
): Promise<Metadata> {
  const numericId = parseInt(idParam, 10);
  if (!idParam || Number.isNaN(numericId)) {
    return {
      title: 'Agent | Global Score Agent',
      robots: { index: false, follow: false },
    };
  }

  const lookupBy: AgentRouteLookupBy = parseAgentRouteLookupBy(
    Array.isArray(lookupByRaw) ? lookupByRaw[0] : lookupByRaw,
  );

  const supabase = getSupabaseReadClient();
  if (!supabase) {
    return {
      title: 'Agent | Global Score Agent',
      robots: { index: false, follow: false },
    };
  }

  const { data, matchedBy } = await fetchAgentByRouteId(
    supabase,
    numericId,
    AGENT_SEO_SELECT,
    lookupBy,
  );

  if (!data || matchedBy == null) {
    return {
      title: 'Agent not found | Global Score Agent',
      robots: { index: false, follow: false },
    };
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const description =
    typeof data.description === 'string' && data.description.trim()
      ? data.description.trim()
      : null;
  const imageUrl =
    typeof data.image_url === 'string' && data.image_url.trim()
      ? data.image_url.trim()
      : null;

  const routeId = matchedBy === 'agent_id' ? String(data.agent_id ?? numericId) : String(data.id ?? numericId);

  return buildPublicAgentMetadata({
    name: name || `Agent ${routeId}`,
    description,
    imageUrl,
    routeId,
    lookupBy: matchedBy,
    view,
    lang,
  });
}
