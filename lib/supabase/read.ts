import { createClient, SupabaseClient } from '@supabase/supabase-js';

let readClient: SupabaseClient | null = null;

/**
 * Cliente de solo lectura para API routes.
 * Usa service role si existe; si no, anon (requiere RLS/grants en Supabase).
 */
export function getSupabaseReadClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!readClient) {
    readClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return readClient;
}
