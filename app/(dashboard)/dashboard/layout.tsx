// app/(dashboard)/dashboard/layout.tsx
// Layout del dashboard con soporte completo para tema claro/oscuro

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { createClient } from '@/utils/supabase/server';
import DashboardLayoutClient from './components/DashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Dashboard | Global Score Agent',
  description: 'Panel de control - Monitorea agentes ERC-8004 y sus scores HUMI',
};

export type DashboardSessionUser = {
  email?: string;
  display_name: string;
  avatar_url?: string;
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
