'use client';

import { useActionState } from 'react';
import { assignZoneAgentsAction } from '@/app/actions/zone.actions';
import type { Agent } from '@/types/agent';

export function ZoneAgentAssignForm({
  zoneId,
  agents,
  primaryAgentId,
  backupAgentId,
}: {
  zoneId: string;
  agents: Agent[];
  primaryAgentId?: string;
  backupAgentId?: string;
}) {
  const action = assignZoneAgentsAction.bind(null, zoneId);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">Saved.</div>
      )}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Primary agent</label>
        <select
          name="primary_agent_id"
          defaultValue={primaryAgentId ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Backup agent</label>
        <select
          name="backup_agent_id"
          defaultValue={backupAgentId ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isPending} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save agents'}
      </button>
    </form>
  );
}
