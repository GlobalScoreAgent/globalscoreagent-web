// utils/supabase/client.ts
// Cliente de Supabase para componentes del lado del cliente (Dashboard)
// Usa el paquete @supabase/ssr (estándar moderno de Supabase + Next.js)

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};