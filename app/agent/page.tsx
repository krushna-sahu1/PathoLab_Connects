import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { agentService } from '@/services/agent.service';
import { AgentStatusBadge } from '@/components/agents/agent-status-badge';
import { JobCard } from '@/components/agent/job-card';
import Link from 'next/link';

export default async function AgentDashboardPage() {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">No Agent Profile</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Your account is not linked to any agent record. Please contact your administrator.
        </p>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Go to Dashboard</a>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todaysCollections = await collectionService.getCollectionsByAgent(agent.id, today);

  const pending = todaysCollections.filter((c) => ['assigned', 'accepted', 'on_the_way', 'arrived'].includes(c.status));
  const done = todaysCollections.filter((c) => ['collected', 'failed'].includes(c.status));

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="space-y-5">
      {/* Agent greeting */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Good day</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{agent.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{todayFormatted}</p>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 px-3 py-3 text-center">
            <p className="text-xl font-bold text-blue-700">{todaysCollections.length}</p>
            <p className="text-xs text-blue-500 mt-0.5">Total</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-3 py-3 text-center">
            <p className="text-xl font-bold text-amber-700">{pending.length}</p>
            <p className="text-xs text-amber-500 mt-0.5">Pending</p>
          </div>
          <div className="rounded-xl bg-green-50 px-3 py-3 text-center">
            <p className="text-xl font-bold text-green-700">{done.length}</p>
            <p className="text-xs text-green-500 mt-0.5">Done</p>
          </div>
        </div>
      </div>

      {/* Today's jobs */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today's Jobs</h2>

        {todaysCollections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-semibold text-gray-700">All clear for today!</p>
            <p className="text-sm text-gray-400 mt-1">No collections assigned for {todayFormatted}.</p>
          </div>
        ) : (
          todaysCollections.map((col) => (
            <JobCard key={col.id} collection={col} />
          ))
        )}
      </div>
    </div>
  );
}
