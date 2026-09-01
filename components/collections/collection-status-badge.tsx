import type { CollectionStatus } from '@/types/collection';

const STYLES: Record<CollectionStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  assigned: 'bg-blue-100 text-blue-700',
  accepted: 'bg-indigo-100 text-indigo-700',
  on_the_way: 'bg-purple-100 text-purple-700',
  arrived: 'bg-yellow-100 text-yellow-700',
  collected: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  rescheduled: 'bg-orange-100 text-orange-700',
};

const LABELS: Record<CollectionStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  accepted: 'Accepted',
  on_the_way: 'On The Way',
  arrived: 'Arrived',
  collected: 'Collected',
  failed: 'Failed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
};

export function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
