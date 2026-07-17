'use client';

import { AgentOverviewView } from '@/components/agents/AgentOverviewView';
import { DashboardSubscriptionGate } from '@/components/dashboard/DashboardSubscriptionGate';

export default function AgentDetailPage() {
  return (
    <DashboardSubscriptionGate>
      <AgentOverviewView routeScope="dashboard" />
    </DashboardSubscriptionGate>
  );
}
