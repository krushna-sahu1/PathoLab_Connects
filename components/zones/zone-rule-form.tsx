'use client';

import { useActionState } from 'react';
import { addZoneRuleAction } from '@/app/actions/zone.actions';

export function ZoneRuleForm({ zoneId }: { zoneId: string }) {
  const action = addZoneRuleAction.bind(null, zoneId);
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
          Rule added!
        </div>
      )}

      <div className="flex gap-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Rule Type</label>
          <select
            name="rule_type"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pincode">Pincode</option>
            <option value="sector">Sector</option>
            <option value="area">Area</option>
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Value</label>
          <input
            name="rule_value"
            type="text"
            required
            placeholder="e.g. 110001 or Sector 1 or Rohini"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Adding…' : 'Add Rule'}
          </button>
        </div>
      </div>
    </form>
  );
}
