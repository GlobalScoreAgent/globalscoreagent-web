// utils/supabase/server.ts
// Cliente de Supabase para componentes Server (usado en layout.tsx y page.tsx)
// Usa @supabase/ssr - estándar oficial para Next.js App Router

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar errores de cookies en rutas estáticas
          }
        },
      },

    }
  );
};

// Función helper para ejecutar consultas con timeout extendido
export const executeWithExtendedTimeout = async <T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 60000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([queryFn(), timeoutPromise]);
};
