import Link from 'next/link';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';
import { PriorityBadge } from '@/components/collections/priority-badge';
import type { CollectionWithDetails } from '@/services/collection.service';

const STATUS_BORDER: Record<string, string> = {
  assigned: 'border-l-blue-500',
  accepted: 'border-l-indigo-500',
  on_the_way: 'border-l-purple-500',
  arrived: 'border-l-yellow-500',
  collected: 'border-l-green-500',
  failed: 'border-l-red-400',
  new: 'border-l-gray-400',
  cancelled: 'border-l-gray-300',
  rescheduled: 'border-l-orange-400',
};

export function JobCard({ collection }: { collection: CollectionWithDetails }) {
  return (
    <Link
      href={`/agent/jobs/${collection.id}`}
      className={`block bg-white rounded-2xl border border-gray-200 border-l-4 ${STATUS_BORDER[collection.status] ?? 'border-l-gray-300'} p-4 hover:shadow-sm transition-all active:scale-[0.99]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CollectionStatusBadge status={collection.status} />
            <PriorityBadge priority={collection.priority} />
          </div>
          <p className="font-semibold text-gray-900 truncate">{collection.patients?.full_name}</p>
          <p className="text-sm text-gray-500 truncate">{collection.patient_addresses?.full_address}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-700">{collection.time_slot?.split(' - ')[0]}</p>
          <p className="text-xs text-gray-400">{collection.patient_addresses?.area ?? collection.patient_addresses?.pincode}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-mono text-gray-400">{collection.collection_id}</p>
        <span className="text-xs text-blue-600 font-medium">Open →</span>
      </div>
    </Link>
  );
}
