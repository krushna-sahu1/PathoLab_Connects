'use client';

import { useActionState } from 'react';
import { addAddressAction } from '@/app/actions/patient.actions';

interface AddressFormProps {
  patientId: string;
}

export function AddressForm({ patientId }: AddressFormProps) {
  const action = addAddressAction.bind(null, patientId);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Address added successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Label *</label>
          <select
            name="label"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Pincode *</label>
          <input
            name="pincode"
            type="text"
            required
            maxLength={6}
            placeholder="6-digit pincode"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Full Address *</label>
          <textarea
            name="full_address"
            required
            rows={2}
            placeholder="House / Flat No., Street, Locality"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Area</label>
          <input
            name="area"
            type="text"
            placeholder="Area name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Sector</label>
          <input
            name="sector"
            type="text"
            placeholder="Sector (e.g. Sector 1)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            name="is_primary"
            type="checkbox"
            value="true"
            id="is_primary"
            className="rounded border-gray-300"
          />
          <label htmlFor="is_primary" className="text-sm text-gray-700">Set as primary address</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Adding…' : 'Add Address'}
      </button>
    </form>
  );
}
