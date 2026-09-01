import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { JobCard } from '@/components/agent/job-card';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AgentJobsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);

  if (!agent) {
    return <div className="text-center py-12 text-gray-400">No agent profile linked to your account.</div>;
  }

  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = params.date ?? today;

  const collections = await collectionService.getCollectionsByAgent(agent.id, selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Jobs</h2>
      </div>

      {/* Date picker */}
      <form method="GET">
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange="this.form.submit()"
        />
      </form>

      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-gray-500 text-sm">No jobs for this date.</p>
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
