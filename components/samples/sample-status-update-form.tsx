'use client';

import { useActionState } from 'react';
import { updateSampleStatusAction } from '@/app/actions/sample.actions';
import type { SampleStatus } from '@/services/sample.service';

const NEXT_STATUSES: Partial<Record<SampleStatus, { value: SampleStatus; label: string }[]>> = {
  collected: [{ value: 'in_transit', label: 'Mark In Transit' }],
  in_transit: [{ value: 'received_at_lab', label: 'Received at Lab' }],
  received_at_lab: [{ value: 'accepted', label: 'Accept Sample' }],
  accepted: [{ value: 'processing', label: 'Start Processing' }],
  processing: [{ value: 'testing', label: 'Start Testing' }],
  testing: [],
};

export function SampleStatusUpdateForm({
  sampleId,
  currentStatus,
}: {
  sampleId: string;
  currentStatus: SampleStatus;
}) {
  const action = updateSampleStatusAction.bind(null, sampleId);
  const [state, formAction, isPending] = useActionState(action, null);

  const options = NEXT_STATUSES[currentStatus] ?? [];

  if (options.length === 0) {
    if (currentStatus === 'testing') {
      return <p className="text-sm text-gray-500">Upload a report to advance to Report Ready.</p>;
    }
    return null;
  }

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <input type="hidden" name="status" value={options[0].value} />
      <input
        name="remark"
        type="text"
        placeholder="Optional remark…"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Updating…' : options[0].label}
      </button>
    </form>
  );
}
