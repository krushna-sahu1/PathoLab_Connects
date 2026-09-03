'use client';

import { useActionState } from 'react';
import { updateCollectionStatusAction } from '@/app/actions/collection.actions';
import type { CollectionStatus } from '@/types/collection';

const AGENT_TRANSITIONS: Partial<Record<CollectionStatus, { value: CollectionStatus; label: string; color: string }[]>> = {
  assigned: [
    { value: 'accepted', label: '✅ Accept Job', color: 'bg-hp-ink hover:bg-hp-ink-soft' },
    { value: 'failed', label: '❌ Unable to Accept', color: 'bg-hp-copper-deep hover:bg-hp-copper' },
  ],
  accepted: [
    { value: 'on_the_way', label: '🚗 I\'m On The Way', color: 'bg-hp-copper hover:bg-hp-copper-deep' },
    { value: 'failed', label: '❌ Cannot Proceed', color: 'bg-hp-copper-deep hover:bg-hp-copper' },
  ],
  on_the_way: [
    { value: 'arrived', label: '📍 Arrived at Location', color: 'bg-hp-copper hover:bg-hp-copper-deep' },
    { value: 'failed', label: '❌ Cannot Reach', color: 'bg-hp-copper-deep hover:bg-hp-copper' },
  ],
  arrived: [
    { value: 'collected', label: '🧪 Sample Collected ✓', color: 'bg-hp-ink hover:bg-hp-ink-soft' },
    { value: 'failed', label: '❌ Unable to Collect', color: 'bg-hp-copper-deep hover:bg-hp-copper' },
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
        <div className="rounded-xl bg-hp-copper/10 border border-hp-copper/40 p-3 text-sm text-hp-copper-deep">
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
              className="w-full rounded-xl border border-hp-sand-2 bg-hp-paper px-4 py-3 text-base mb-2 focus:outline-none focus:ring-2 focus:ring-hp-copper"
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
            className={`w-full min-h-14 rounded-xl text-hp-paper font-semibold text-base disabled:opacity-50 ${option.color}`}
          >
            {isPending ? 'Updating…' : option.label}
          </button>
        </form>
      ))}
    </div>
  );
}
