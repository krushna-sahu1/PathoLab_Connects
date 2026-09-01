import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { agentService } from '@/services/agent.service';
import { AgentStatusBadge } from '@/components/agents/agent-status-badge';
import { AgentStatusForm } from '@/components/agents/agent-status-form';
import { AvailabilityPanel } from '@/components/agents/availability-panel';

export default async function AgentProfilePage() {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return <div className="text-center py-12 text-gray-400">No agent profile found.</div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const availability = await agentService.getAvailabilityRange(agent.id, today, nextWeek);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">My Profile</h2>

      {/* Agent info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.phone}</p>
            <div className="mt-1">
              <AgentStatusBadge status={agent.status} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Daily Capacity</p>
            <p className="font-semibold text-gray-800">{agent.daily_capacity} collections</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Working Days</p>
            <p className="font-semibold text-gray-800 capitalize text-xs">
              {agent.working_days?.slice(0, 3).map((d: string) => d.slice(0, 3)).join(', ')}…
            </p>
          </div>
        </div>
      </div>

      {/* Quick status change */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">My Status</h3>
        <AgentStatusForm agentId={agent.id} currentStatus={agent.status} />
      </div>

      {/* Availability */}
      <AvailabilityPanel
        agentId={agent.id}
        availability={availability}
        fromDate={today}
        toDate={nextWeek}
        canWrite={true}
      />

      {/* Sign out */}
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="w-full h-12 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
