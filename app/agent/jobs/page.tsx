import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { JobCard } from '@/components/agent/job-card';
import { JobDateFilter } from '@/components/agent/job-date-filter';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AgentJobsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return <div className="text-center py-12 text-hp-ink-muted">No agent profile linked to your account.</div>;
  }

  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = params.date ?? today;

  const collections = await collectionService.getCollectionsByAgent(agent.id, selectedDate);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-hp-ink">My Jobs</h2>

      <JobDateFilter defaultValue={selectedDate} />

      {collections.length === 0 ? (
        <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-8 text-center">
          <p className="text-hp-ink-muted text-sm">No jobs for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <JobCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
