'use client';

import { AgentHumiDetailView } from '@/components/agents/AgentHumiDetailView';
import { DashboardSubscriptionGate } from '@/components/dashboard/DashboardSubscriptionGate';

export default function AgentHumiDetailPage() {
  return (
    <DashboardSubscriptionGate>
      <AgentHumiDetailView routeScope="dashboard" />
    </DashboardSubscriptionGate>
  );
}
