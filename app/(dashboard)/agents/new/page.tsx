import { requireRole } from '@/lib/auth/session';
import { zoneService } from '@/services/zone.service';
import { AgentForm } from '@/components/agents/agent-form';
import Link from 'next/link';

export default async function NewAgentPage() {
  await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);
  const zones = await zoneService.getZones();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/agents" className="text-sm text-gray-500 hover:text-gray-700">← Agents</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">New Agent</h2>
      </div>
      <AgentForm zones={zones} />
    </div>
  );
}
