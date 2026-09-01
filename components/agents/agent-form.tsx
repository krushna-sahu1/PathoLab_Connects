'use client';

import { useActionState } from 'react';
import { createAgentAction, updateAgentAction } from '@/app/actions/agent.actions';
import type { Agent } from '@/types/agent';
import type { Zone } from '@/types/zone';

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

interface AgentFormProps {
  agent?: Agent;
  zones: (Zone & { zone_rules?: unknown[] })[];
}

export function AgentForm({ agent, zones }: AgentFormProps) {
  const action = agent
    ? updateAgentAction.bind(null, agent.id)
    : createAgentAction;

  const [state, formAction, isPending] = useActionState(action, null);

  const defaultWorkingDays = agent?.working_days ?? ['monday','tuesday','wednesday','thursday','friday','saturday'];

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Agent updated successfully
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={agent?.name}
            placeholder="Agent's full name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Phone *</label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={agent?.phone}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={agent?.email ?? ''}
            placeholder="optional"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Primary Zone</label>
          <select
            name="primary_zone_id"
            defaultValue={agent?.primary_zone_id ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No zone assigned</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Daily Capacity *</label>
          <input
            name="daily_capacity"
            type="number"
            required
            min={1}
            max={50}
            defaultValue={agent?.daily_capacity ?? 10}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">Max collections per day</p>
        </div>

        {agent && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              defaultValue={agent.status}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  name={`day_${key}`}
                  defaultChecked={defaultWorkingDays.includes(key)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving…' : agent ? 'Update Agent' : 'Create Agent'}
        </button>
        <a
          href={agent ? `/agents/${agent.id}` : '/agents'}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
