import { redirect } from 'next/navigation';

export default function AgentWamiDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/agents/${encodeURIComponent(params.id)}`);
}
