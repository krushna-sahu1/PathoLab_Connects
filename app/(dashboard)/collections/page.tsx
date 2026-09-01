import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { collectionService } from '@/services/collection.service';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';
import { PriorityBadge } from '@/components/collections/priority-badge';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'on_the_way', label: 'On The Way' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'collected', label: 'Collected' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; date?: string; page?: string }>;
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'collections:write');
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const { collections, total } = await collectionService.getCollections({
    status: params.status,
    date: params.date,
    page,
  });

  const opsQueue = await collectionService.getOperationsQueue();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
          <p className="mt-1 text-sm text-gray-500">{total} total</p>
        </div>
        {canWrite && (
          <Link
            href="/collections/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            + New Collection
          </Link>
        )}
      </div>

      {/* Operations Queue Alert */}
      {opsQueue.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              ⚠ Operations Queue: {opsQueue.length} collection{opsQueue.length !== 1 ? 's' : ''} need manual assignment
            </p>
            <p className="text-xs text-amber-700 mt-0.5">These collections have no matching zone or no available agent.</p>
          </div>
          <Link href="/collections?status=new" className="text-sm font-medium text-amber-800 hover:underline">
            View →
          </Link>
        </div>
      )}

      {/* Filters */}
      <form method="GET" className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          defaultValue={params.date ?? ''}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Filter
        </button>
        <a href="/collections" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
          Clear
        </a>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date / Slot</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {collections.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No collections found</td>
              </tr>
            ) : (
              collections.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{col.collection_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{col.patients?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{col.patients?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{col.date}</p>
                    <p className="text-xs text-gray-400">{col.time_slot}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{col.zones?.name ?? <span className="text-amber-500">Unzoned</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{col.agents?.name ?? <span className="text-amber-500">Unassigned</span>}</td>
                  <td className="px-4 py-3"><CollectionStatusBadge status={col.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={col.priority} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/collections/${col.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
