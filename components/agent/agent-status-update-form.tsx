'use client';

import { useActionState } from 'react';
import { updateCollectionStatusAction } from '@/app/actions/collection.actions';
import type { CollectionStatus } from '@/types/collection';

const AGENT_TRANSITIONS: Partial<Record<CollectionStatus, { value: CollectionStatus; label: string; color: string }[]>> = {
  assigned: [
    { value: 'accepted', label: '✅ Accept Job', color: 'bg-blue-600 hover:bg-blue-700' },
    { value: 'failed', label: '❌ Unable to Accept', color: 'bg-red-500 hover:bg-red-600' },
  ],
  accepted: [
    { value: 'on_the_way', label: '🚗 I\'m On The Way', color: 'bg-purple-600 hover:bg-purple-700' },
    { value: 'failed', label: '❌ Cannot Proceed', color: 'bg-red-500 hover:bg-red-600' },
  ],
  on_the_way: [
    { value: 'arrived', label: '📍 Arrived at Location', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'failed', label: '❌ Cannot Reach', color: 'bg-red-500 hover:bg-red-600' },
  ],
  arrived: [
    { value: 'collected', label: '🧪 Sample Collected ✓', color: 'bg-green-600 hover:bg-green-700' },
    { value: 'failed', label: '❌ Unable to Collect', color: 'bg-red-500 hover:bg-red-600' },
  ],
};

const FAILURE_REASONS = [
  'Patient unavailable',
  'Wrong address',
  'Patient cancelled',
  'No response',
  'Address inaccessible',
  'Other',
];

export function AgentStatusUpdateForm({
  collectionId,
  currentStatus,
}: {
  collectionId: string;
  currentStatus: CollectionStatus;
}) {
  const action = updateCollectionStatusAction.bind(null, collectionId);
  const [state, formAction, isPending] = useActionState(action, null);

  const options = AGENT_TRANSITIONS[currentStatus] ?? [];

  if (options.length === 0) {
    return <p className="text-sm text-gray-400">No actions available for current status.</p>;
  }

  return (
    <div className="space-y-3">
      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {options.map((option) => (
        <form key={option.value} action={formAction}>
          <input type="hidden" name="status" value={option.value} />
          {option.value === 'failed' && (
            <select
              name="failure_reason"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Select reason for failure…</option>
              {FAILURE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full h-14 rounded-xl text-white font-semibold text-base transition-colors disabled:opacity-50 ${option.color}`}
          >
            {isPending ? 'Updating…' : option.label}
          </button>
        </form>
      ))}
    </div>
  );
}
