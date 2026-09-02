'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createCollectionAction } from '@/app/actions/collection.actions';
import type { Patient } from '@/types/patient';

import { COLLECTION_TIME_SLOTS } from '@/lib/constants';

interface CollectionFormProps {
  patients: Patient[];
}

export function CollectionForm({ patients }: CollectionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [state, formAction, isPending] = useActionState(createCollectionAction, null);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{state.error}</div>
      )}

      <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
        💡 After creating, the assignment engine will automatically find the best available agent based on zone rules.
      </div>

      {/* Patient selector */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Patient *</label>
        <select
          name="patient_id"
          required
          onChange={(e) => {
            const p = patients.find((p) => p.id === e.target.value) ?? null;
            setSelectedPatient(p);
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name} — {p.phone}</option>
          ))}
        </select>
      </div>

      {/* Address selector — requires patient fetch from API */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Collection Address *</label>
        <input
          name="address_id"
          type="text"
          required
          placeholder="Enter address UUID (will be a dropdown in a future iteration)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">Go to the patient's profile to get their address ID, or use the Patient 360 view to book directly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input
            name="date"
            type="date"
            required
            min={today}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Time Slot *</label>
          <select
            name="time_slot"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select slot…</option>
            {COLLECTION_TIME_SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
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
            <option value="normal">Normal</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <input
            name="notes"
            type="text"
            placeholder="Optional notes for agent"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Creating & Assigning…' : 'Create Collection'}
        </button>
        <a href="/collections" className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Cancel
        </a>
      </div>
    </form>
  );
}
