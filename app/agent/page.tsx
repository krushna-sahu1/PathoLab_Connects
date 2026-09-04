import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { AgentDutyChip } from '@/components/agent/agent-status-chip';
import { JobCard } from '@/components/agent/job-card';

export default async function AgentDashboardPage() {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-2">
        <h2 className="font-display text-2xl font-semibold text-hp-ink">No Agent Profile</h2>
        <p className="text-sm text-hp-ink-muted max-w-xs">
          Your account is not linked to any agent record. Please contact your administrator.
        </p>
        <a href="/dashboard" className="inline-flex items-center justify-center min-h-12 px-5 rounded-xl bg-hp-ink text-hp-paper text-sm font-semibold">
          ← Go to Dashboard
        </a>
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
    <div className="space-y-6">
      <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-hp-ink-muted font-semibold uppercase tracking-[0.14em]">Good day</p>
            <h1 className="font-display text-2xl font-semibold text-hp-ink mt-1 leading-tight truncate">{agent.name}</h1>
            <p className="text-sm text-hp-ink-muted mt-1">{todayFormatted}</p>
          </div>
          <AgentDutyChip status={agent.status} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-hp-ink px-2 py-3 text-center">
            <p className="text-xl font-bold text-hp-paper">{todaysCollections.length}</p>
            <p className="text-[11px] text-hp-sand mt-0.5">Total</p>
          </div>
          <div className="rounded-xl bg-hp-copper px-2 py-3 text-center">
            <p className="text-xl font-bold text-hp-paper">{pending.length}</p>
            <p className="text-[11px] text-hp-paper/80 mt-0.5">Pending</p>
          </div>
          <div className="rounded-xl bg-hp-sand-2 px-2 py-3 text-center">
            <p className="text-xl font-bold text-hp-ink">{done.length}</p>
            <p className="text-[11px] text-hp-ink-muted mt-0.5">Done</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[11px] font-semibold text-hp-ink-muted uppercase tracking-[0.14em]">Today&apos;s Jobs</h2>

        {todaysCollections.length === 0 ? (
          <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-8 text-center">
            <p className="font-display text-xl font-semibold text-hp-ink">All clear for today!</p>
            <p className="text-sm text-hp-ink-muted mt-2">No collections assigned for {todayFormatted}.</p>
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
