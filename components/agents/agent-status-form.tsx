'use client';

import { useActionState } from 'react';
import { updateAgentStatusAction } from '@/app/actions/agent.actions';
import type { AgentStatus } from '@/types/agent';

export function AgentStatusForm({
  agentId,
  currentStatus,
}: {
  agentId: string;
  currentStatus: AgentStatus;
}) {
  const action = updateAgentStatusAction.bind(null, agentId);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex gap-2">
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <select
        name="status"
        defaultValue={currentStatus}
        className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="available">Available</option>
        <option value="busy">Busy</option>
        <option value="offline">Offline</option>
        <option value="on_leave">On Leave</option>
        <option value="inactive">Inactive</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '…' : 'Update'}
      </button>
    </form>
  );
}
