import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { AgentStatusUpdateForm } from '@/components/agent/agent-status-update-form';
import { AgentStatusChip } from '@/components/agent/agent-status-chip';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentJobDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);
  const { id } = await params;

  if (!agent) {
    return <div className="text-center py-12 text-hp-ink-muted">No agent profile found.</div>;
  }

  let collection;
  try {
    collection = await collectionService.getCollectionById(id);
  } catch {
    notFound();
  }

  // Only the assigned agent can see their job detail
  if (collection.agent_id !== agent.id) {
    redirect('/agent');
  }

  const history = collection.collection_status_history ?? [];
  const isActive = !['collected', 'failed', 'cancelled'].includes(collection.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/agent"
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-hp-paper border border-hp-sand-2 text-hp-ink"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-hp-ink text-lg truncate">{collection.collection_id}</h2>
          <div className="mt-1">
            <AgentStatusChip status={collection.status} />
          </div>
        </div>
      </div>

      <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-hp-ink flex items-center justify-center text-hp-paper font-bold shrink-0 text-lg">
            {collection.patients?.full_name?.charAt(0) ?? 'P'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-hp-ink text-base">{collection.patients?.full_name}</p>
            <a href={`tel:${collection.patients?.phone}`} className="text-sm font-medium text-hp-copper break-all">
              {collection.patients?.phone}
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-hp-sand p-3 space-y-1">
          <p className="text-[11px] text-hp-ink-muted font-semibold tracking-[0.12em]">ADDRESS</p>
          <p className="text-sm text-hp-ink leading-relaxed">{collection.patient_addresses?.full_address}</p>
          {collection.patient_addresses?.area && (
            <p className="text-xs text-hp-ink-muted">{collection.patient_addresses.area} · {collection.patient_addresses.pincode}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-hp-sand p-3">
            <p className="text-[11px] text-hp-ink-muted font-semibold tracking-[0.12em]">DATE</p>
            <p className="text-sm font-semibold text-hp-ink mt-0.5">{collection.date}</p>
          </div>
          <div className="rounded-xl bg-hp-sand p-3">
            <p className="text-[11px] text-hp-ink-muted font-semibold tracking-[0.12em]">TIME SLOT</p>
            <p className="text-sm font-semibold text-hp-ink mt-0.5">{collection.time_slot}</p>
          </div>
        </div>

        {collection.notes && (
          <div className="rounded-xl bg-hp-copper/10 border border-hp-copper/30 p-3">
            <p className="text-[11px] text-hp-copper-deep font-semibold tracking-[0.12em]">NOTES FROM OPS</p>
            <p className="text-sm text-hp-ink mt-0.5">{collection.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${collection.patients?.phone}`}
            className="flex items-center justify-center gap-2 min-h-14 rounded-xl bg-hp-copper text-hp-paper font-semibold text-sm"
          >
            📞 Call Patient
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(collection.patient_addresses?.full_address ?? '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 min-h-14 rounded-xl bg-hp-ink text-hp-paper font-semibold text-sm"
          >
            🗺️ Navigate
          </a>
        </div>
      </div>

      {isActive && (
        <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5">
          <h3 className="font-display font-semibold text-hp-ink text-lg mb-4">Update Status</h3>
          <AgentStatusUpdateForm collectionId={id} currentStatus={collection.status} />
        </div>
      )}

      {!isActive && (
        <div className="bg-hp-ink rounded-2xl p-5 text-center">
          <p className="font-display font-semibold text-hp-paper text-lg">Job Complete</p>
          <p className="text-sm text-hp-sand mt-1">Status: {collection.status}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-hp-paper rounded-2xl border border-hp-sand-2 p-5">
          <h3 className="font-display font-semibold text-hp-ink text-lg mb-3">History</h3>
          <ol className="space-y-3">
            {[...history]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-hp-copper shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize text-hp-ink">{h.new_status.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-hp-ink-muted">{new Date(h.created_at).toLocaleString('en-IN')}</p>
                    {h.remark && <p className="text-xs text-hp-ink-muted italic">{h.remark}</p>}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
