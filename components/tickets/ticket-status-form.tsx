'use client';

import { useActionState } from 'react';
import { updateTicketStatusAction } from '@/app/actions/ticket.actions';
import type { TicketStatus } from '@/types/ticket';

const NEXT_STATUSES: Partial<Record<TicketStatus, { value: TicketStatus; label: string }[]>> = {
  open: [
    { value: 'in_progress', label: 'Start Progress' },
    { value: 'waiting', label: 'Waiting on Patient' },
    { value: 'closed', label: 'Close' },
  ],
  assigned: [
    { value: 'in_progress', label: 'Start Progress' },
    { value: 'waiting', label: 'Waiting on Patient' },
    { value: 'resolved', label: 'Resolve' },
  ],
  in_progress: [
    { value: 'waiting', label: 'Waiting on Patient' },
    { value: 'resolved', label: 'Resolve' },
  ],
  waiting: [
    { value: 'in_progress', label: 'Resume' },
    { value: 'resolved', label: 'Resolve' },
  ],
  resolved: [
    { value: 'closed', label: 'Close' },
    { value: 'in_progress', label: 'Reopen' },
  ],
};

export function TicketStatusForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
}) {
  const action = updateTicketStatusAction.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, null);
  const options = NEXT_STATUSES[currentStatus] ?? [];

  if (options.length === 0) {
    return <p className="text-sm text-gray-400">No further status changes</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <select
        name="status"
        required
        defaultValue={options[0].value}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
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
        {isPending ? 'Updating…' : 'Update Status'}
      </button>
    </form>
  );
}
