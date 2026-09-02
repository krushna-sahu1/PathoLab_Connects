'use client';

import { useActionState } from 'react';
import { createTicketAction } from '@/app/actions/ticket.actions';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '@/lib/constants';
import type { Patient } from '@/types/patient';

export function TicketForm({
  patients,
  defaultPatientId,
}: {
  patients: Patient[];
  defaultPatientId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createTicketAction, null);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Patient *</label>
        <select
          name="patient_id"
          required
          defaultValue={defaultPatientId ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} — {p.phone}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            defaultValue="normal"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TICKET_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description *</label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="What does the patient need help with?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Creating…' : 'Create Ticket'}
      </button>
    </form>
  );
}
