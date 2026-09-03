import Link from 'next/link';
import { AgentStatusChip } from '@/components/agent/agent-status-chip';
import type { CollectionWithDetails } from '@/services/collection.service';

const STATUS_BAR: Record<string, string> = {
  assigned: 'bg-hp-ink',
  accepted: 'bg-hp-ink-soft',
  on_the_way: 'bg-hp-copper',
  arrived: 'bg-hp-copper-deep',
  collected: 'bg-hp-ink',
  failed: 'bg-hp-copper-deep',
  new: 'bg-hp-ink-muted',
  cancelled: 'bg-hp-ink-muted',
  rescheduled: 'bg-hp-copper',
};

export function JobCard({ collection }: { collection: CollectionWithDetails }) {
  return (
    <Link
      href={`/agent/jobs/${collection.id}`}
      className="block bg-hp-paper rounded-2xl border border-hp-sand-2 overflow-hidden active:bg-hp-sand"
    >
      <span className={`block h-1.5 ${STATUS_BAR[collection.status] ?? 'bg-hp-ink-muted'}`} />
      <div className="p-4 min-h-[4.5rem]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <AgentStatusChip status={collection.status} />
              {collection.priority === 'urgent' && (
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-hp-copper text-hp-paper">
                  Urgent
                </span>
              )}
            </div>
            <p className="font-semibold text-hp-ink text-base leading-snug truncate">
              {collection.patients?.full_name}
            </p>
            <p className="text-sm text-hp-ink-muted mt-0.5 line-clamp-2">
              {collection.patient_addresses?.full_address}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-hp-ink">{collection.time_slot?.split(' - ')[0]}</p>
            <p className="text-xs text-hp-ink-muted mt-0.5">
              {collection.patient_addresses?.area ?? collection.patient_addresses?.pincode}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-mono text-hp-ink-muted">{collection.collection_id}</p>
          <span className="text-xs font-semibold text-hp-copper">Open →</span>
        </div>
      </div>
    </Link>
  );
}
