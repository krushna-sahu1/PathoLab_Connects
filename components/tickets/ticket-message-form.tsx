'use client';

import { useActionState } from 'react';
import { addTicketMessageAction } from '@/app/actions/ticket.actions';

export function TicketMessageForm({ ticketId }: { ticketId: string }) {
  const action = addTicketMessageAction.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Add a note for the team or patient record…"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Add Message'}
      </button>
    </form>
  );
}
