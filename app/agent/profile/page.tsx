import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { agentService } from '@/services/agent.service';
import { AgentDutyChip } from '@/components/agent/agent-status-chip';
import { AgentStatusForm } from '@/components/agents/agent-status-form';
import { AvailabilityPanel } from '@/components/agents/availability-panel';

export default async function AgentProfilePage() {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return <div className="text-center py-12 text-hp-ink-muted">No agent profile found.</div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const availability = await agentService.getAvailabilityRange(agent.id, today, nextWeek);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-hp-ink">My Profile</h2>

      <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-hp-ink flex items-center justify-center text-hp-paper text-2xl font-bold">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-hp-ink text-lg truncate">{agent.name}</h3>
            <p className="text-sm text-hp-ink-muted">{agent.phone}</p>
            <div className="mt-1">
              <AgentDutyChip status={agent.status} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-hp-sand p-3">
            <p className="text-[11px] text-hp-ink-muted font-semibold">Daily Capacity</p>
            <p className="font-semibold text-hp-ink mt-0.5">{agent.daily_capacity} collections</p>
          </div>
          <div className="rounded-xl bg-hp-sand p-3">
            <p className="text-[11px] text-hp-ink-muted font-semibold">Working Days</p>
            <p className="font-semibold text-hp-ink capitalize text-xs mt-0.5">
              {agent.working_days?.slice(0, 3).map((d: string) => d.slice(0, 3)).join(', ')}…
            </p>
          </div>
        </div>
      </div>

      <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5">
        <h3 className="font-display font-semibold text-hp-ink mb-3">My Status</h3>
        <AgentStatusForm agentId={agent.id} currentStatus={agent.status} />
      </div>

      <div className="[&>div]:bg-hp-paper [&>div]:border-hp-sand-2 [&>div]:rounded-2xl">
        <AvailabilityPanel
          agentId={agent.id}
          availability={availability}
          fromDate={today}
          toDate={nextWeek}
          canWrite={true}
        />
      </div>

      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="w-full min-h-12 rounded-xl border border-hp-copper/40 text-hp-copper-deep text-sm font-semibold bg-hp-paper"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
