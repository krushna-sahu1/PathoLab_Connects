import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { agentService } from '@/services/agent.service';
import { AgentStatusBadge } from '@/components/agents/agent-status-badge';
import { AgentStatusForm } from '@/components/agents/agent-status-form';
import { AvailabilityPanel } from '@/components/agents/availability-panel';
import { collectionService } from '@/services/collection.service';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'agents:write');
  const { id } = await params;

  let agent;
  try {
    agent = await agentService.getAgentById(id);
  } catch {
    notFound();
  }

  // Get availability for next 7 days
  const today = new Date();
  const fromDate = today.toISOString().slice(0, 10);
  const toDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const availability = await agentService.getAvailabilityRange(id, fromDate, toDate);
  const todayJobs = await collectionService.getCollectionsByAgent(id, fromDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/agents" className="text-sm text-gray-500 hover:text-gray-700">← Agents</Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
              <AgentStatusBadge status={agent.status} />
            </div>
          </div>
        </div>
        {canWrite && (
          <Link
            href={`/agents/${id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Agent
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent info */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Agent Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{agent.phone}</dd>
              </div>
              {agent.email && (
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{agent.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Primary Zone</dt>
                <dd className="font-medium text-gray-900">{agent.zones?.name ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Daily Capacity</dt>
                <dd className="font-medium text-gray-900">{agent.daily_capacity} collections/day</dd>
              </div>
              <div>
                <dt className="text-gray-500">Working Days</dt>
                <dd className="font-medium text-gray-900 capitalize">
                  {agent.working_days?.join(', ') ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick status change */}
          {canWrite && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
              <AgentStatusForm agentId={id} currentStatus={agent.status} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* 7-day availability */}
          <AvailabilityPanel
            agentId={id}
            availability={availability}
            fromDate={fromDate}
            toDate={toDate}
            canWrite={canWrite}
          />

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Today's Assignments</h3>
            {todayJobs.length === 0 ? (
              <p className="text-sm text-gray-400">No jobs for today</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {todayJobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between">
                    <Link href={`/collections/${job.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {job.collection_id}
                    </Link>
                    <CollectionStatusBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
