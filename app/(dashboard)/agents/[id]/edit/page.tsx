import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { agentService } from '@/services/agent.service';
import { zoneService } from '@/services/zone.service';
import { AgentForm } from '@/components/agents/agent-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: PageProps) {
  await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);
  const { id } = await params;

  let agent;
  try {
    agent = await agentService.getAgentById(id);
  } catch {
    notFound();
  }

  const zones = await zoneService.getZones();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/agents/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← {agent.name}</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">Edit Agent</h2>
      </div>
      <AgentForm agent={agent} zones={zones} />
    </div>
  );
}
