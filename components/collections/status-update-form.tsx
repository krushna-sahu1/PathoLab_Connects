'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateCollectionStatusAction } from '@/app/actions/collection.actions';
import type { CollectionStatus } from '@/types/collection';

const FAILURE_REASONS = [
  'Patient unavailable',
  'Wrong address',
  'Patient cancelled',
  'No response',
  'Address inaccessible',
  'Other',
];

const NEXT_STATUSES: Partial<Record<CollectionStatus, { value: CollectionStatus; label: string }[]>> = {
  new: [
    { value: 'cancelled', label: 'Cancel' },
  ],
  assigned: [
    { value: 'accepted', label: 'Accept' },
    { value: 'cancelled', label: 'Cancel' },
    { value: 'rescheduled', label: 'Reschedule' },
  ],
  accepted: [
    { value: 'on_the_way', label: 'On The Way' },
    { value: 'failed', label: 'Mark Failed' },
    { value: 'cancelled', label: 'Cancel' },
  ],
  on_the_way: [
    { value: 'arrived', label: 'Arrived' },
    { value: 'failed', label: 'Mark Failed' },
  ],
  arrived: [
    { value: 'collected', label: 'Sample Collected ✓' },
    { value: 'failed', label: 'Unable to Collect' },
  ],
  rescheduled: [
    { value: 'new', label: 'Reopen as New' },
    { value: 'cancelled', label: 'Cancel' },
  ],
};

export function StatusUpdateForm({
  collectionId,
  currentStatus,
}: {
  collectionId: string;
  currentStatus: CollectionStatus;
}) {
  const [selectedStatus, setSelectedStatus] = useState<CollectionStatus | ''>('');
  const action = updateCollectionStatusAction.bind(null, collectionId);
  const [state, formAction, isPending] = useActionState(action, null);

  const options = NEXT_STATUSES[currentStatus] ?? [];
  if (options.length === 0) return <p className="text-sm text-gray-400">No status transitions available</p>;

  const showFailureReason = selectedStatus === 'failed';
  const showRemark = !!selectedStatus;

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">New Status</label>
        <select
          name="status"
          required
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as CollectionStatus)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select next status…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {showFailureReason && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Failure Reason</label>
          <select
            name="failure_reason"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select reason…</option>
            {FAILURE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {showRemark && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Remark (optional)</label>
          <input
            name="remark"
            type="text"
            placeholder="Additional notes…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {showRemark && (
        <button
          type="submit"
          disabled={isPending || !selectedStatus}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Updating…' : 'Update Status'}
        </button>
      )}
    </form>
  );
}
