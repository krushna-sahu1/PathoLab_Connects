'use client';

import { useActionState } from 'react';
import { manualAssignAction } from '@/app/actions/collection.actions';
import type { Agent } from '@/types/agent';

export function ManualAssignForm({
  collectionId,
  agents,
}: {
  collectionId: string;
  agents: (Agent & { zones?: { id: string; name: string } | null })[];
}) {
  const action = manualAssignAction.bind(null, collectionId);
  const [state, formAction, isPending] = useActionState(action, null);

  const availableAgents = agents.filter((a) => ['available', 'busy'].includes(a.status));

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">Agent assigned!</div>
      )}
      <select
        name="agent_id"
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select agent…</option>
        {availableAgents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} — {a.zones?.name ?? 'No zone'} (cap: {a.daily_capacity})
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Assigning…' : 'Manually Assign'}
      </button>
    </form>
  );
}
