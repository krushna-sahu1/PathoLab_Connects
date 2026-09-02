'use client';

import { useActionState } from 'react';
import { assignTicketAction } from '@/app/actions/ticket.actions';

export function TicketAssignForm({
  ticketId,
  staff,
}: {
  ticketId: string;
  staff: { id: string; full_name: string; email: string }[];
}) {
  const action = assignTicketAction.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, null);

  if (staff.length === 0) {
    return <p className="text-sm text-gray-400">No assignable staff found</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <select
        name="assigned_to"
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select staff…</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name} ({s.email})
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
      >
        {isPending ? 'Assigning…' : 'Assign'}
      </button>
    </form>
  );
}
