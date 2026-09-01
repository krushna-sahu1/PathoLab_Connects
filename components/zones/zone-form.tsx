'use client';

import { useActionState } from 'react';
import { createZoneAction, updateZoneAction } from '@/app/actions/zone.actions';
import type { Zone } from '@/types/zone';

interface ZoneFormProps {
  zone?: Zone;
}

export function ZoneForm({ zone }: ZoneFormProps) {
  const action = zone
    ? updateZoneAction.bind(null, zone.id)
    : createZoneAction;

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Zone updated successfully
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Zone Name *</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={zone?.name}
          placeholder="e.g. Zone 1 — North"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={zone?.description ?? ''}
          placeholder="Optional description"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Daily Capacity *</label>
        <input
          name="daily_capacity"
          type="number"
          required
          min={1}
          defaultValue={zone?.daily_capacity ?? 20}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">Maximum number of collections per day for this zone</p>
      </div>

      {zone && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="is_active"
            defaultValue={String(zone.is_active)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving…' : zone ? 'Update Zone' : 'Create Zone'}
        </button>
        <a
          href={zone ? `/zones/${zone.id}` : '/zones'}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
