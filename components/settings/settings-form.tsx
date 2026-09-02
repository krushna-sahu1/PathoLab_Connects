'use client';

import { useActionState } from 'react';
import { updateSettingsAction } from '@/app/actions/settings.actions';
import type { AppSettings } from '@/services/settings.service';

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 max-w-xl">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">Settings saved.</div>
      )}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Organization name</label>
        <input
          name="org_name"
          required
          defaultValue={settings.org_name}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Support phone</label>
        <input
          name="support_phone"
          defaultValue={settings.support_phone ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
