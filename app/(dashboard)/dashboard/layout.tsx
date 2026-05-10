// app/(dashboard)/dashboard/layout.tsx
// Layout del dashboard con soporte completo para tema claro/oscuro

import { Metadata } from 'next';
import DashboardLayoutClient from './components/DashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Dashboard | Global Score Agent',
  description: 'Panel de control - Monitorea agentes ERC-8004 y sus scores HUMI',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
