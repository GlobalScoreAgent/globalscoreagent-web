// app/(dashboard)/dashboard/layout.tsx
// Layout del dashboard con soporte completo para tema claro/oscuro

import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { createClient } from '@/utils/supabase/server';
import type { DashboardSessionUser } from './dashboard-session';

export type { DashboardSessionUser };

const DashboardLayoutClient = dynamic(() => import('./components/DashboardLayoutClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
        <p className="text-zinc-600 dark:text-zinc-400">Cargando...</p>
      </div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Dashboard | Global Score Agent',
  description: 'Panel de control - Monitorea agentes ERC-8004 y sus scores HUMI',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildAuthLoginUrl('/dashboard'));
  }

  const meta = user.user_metadata ?? {};
  const sessionUser: DashboardSessionUser = {
    email: user.email,
    display_name:
      (meta.display_name as string | undefined) ??
      (meta.full_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'Usuario',
    avatar_url: meta.avatar_url as string | undefined,
  };

  return <DashboardLayoutClient user={sessionUser}>{children}</DashboardLayoutClient>;
}
