'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WamiIndexRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams?.get('agentId') ?? '';

  useEffect(() => {
    if (!agentId) return;
    router.replace(`/dashboard/agents/${encodeURIComponent(agentId)}/wami`);
  }, [agentId, router]);

  return null;
}
