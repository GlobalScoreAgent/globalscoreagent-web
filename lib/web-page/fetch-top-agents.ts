import { getSupabaseReadClient } from '@/lib/supabase/read';
import {
  parseTop10AgentsFromMv,
  type PublicTop10AgentRow,
} from '@/lib/web-page/top-agents';

export async function fetchPublicTop10Agents(): Promise<PublicTop10AgentRow[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .schema('web_page')
    .from('global_score_agent_summary')
    .select('top_10_agents')
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return [];

  const raw = data as { top_10_agents: unknown };
  return parseTop10AgentsFromMv(raw.top_10_agents);
}
