'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { createCollectionAction } from '@/app/actions/collection.actions';
import type { Patient, PatientAddress } from '@/types/patient';
import { COLLECTION_TIME_SLOTS } from '@/lib/constants';

interface CollectionFormProps {
  patients: Patient[];
}

export function CollectionForm({ patients }: CollectionFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [addresses, setAddresses] = useState<PatientAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [state, formAction, isPending] = useActionState(createCollectionAction, null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!selectedPatientId) {
      setAddresses([]);
      return;
    }
    setLoadingAddresses(true);
    fetch(`/api/patients/${selectedPatientId}`)
      .then((r) => r.json())
      .then((data) => setAddresses(data.patient_addresses ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [selectedPatientId]);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{state.error}</div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Patient *</label>
        <select
          name="patient_id"
          required
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name} — {p.phone}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Collection Address *</label>
        <select
          name="address_id"
          required
          disabled={!selectedPatientId || loadingAddresses}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{loadingAddresses ? 'Loading addresses…' : 'Select address…'}</option>
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} — {a.full_address} ({a.pincode})
            </option>
          ))}
        </select>
        {selectedPatientId && !loadingAddresses && addresses.length === 0 && (
          <p className="text-xs text-amber-600">This patient has no address yet. Add one on the patient profile.</p>
        )}
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
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <input
            name="notes"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
