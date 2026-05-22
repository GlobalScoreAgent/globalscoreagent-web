import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://mezqyworblseixaypftg.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return adminClient;
}
