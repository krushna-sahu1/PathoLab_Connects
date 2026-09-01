'use client';

import { useActionState } from 'react';
import { setAgentAvailabilityAction } from '@/app/actions/agent.actions';
import type { AgentAvailability } from '@/types/agent';

interface AvailabilityPanelProps {
  agentId: string;
  availability: AgentAvailability[];
  fromDate: string;
  toDate: string;
  canWrite: boolean;
}

export function AvailabilityPanel({
  agentId,
  availability,
  fromDate,
  toDate,
  canWrite,
}: AvailabilityPanelProps) {
  // Build date range array
  const dates: string[] = [];
  const cur = new Date(fromDate);
  const end = new Date(toDate);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }

  const availMap = Object.fromEntries(availability.map((a) => [a.date, a]));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Availability — Next 7 Days</h3>
      <div className="space-y-2">
        {dates.map((date) => {
          const rec = availMap[date];
          const isAvailable = rec ? rec.is_available : true; // default available
          const load = rec?.current_load ?? 0;
          const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });

          return (
            <div key={date} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-gray-600 w-28 shrink-0">{dayLabel}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isAvailable ? `Available (${load} assigned)` : 'Unavailable'}
                </span>
              </div>
              {canWrite && (
                <ToggleAvailabilityButton
                  agentId={agentId}
                  date={date}
                  isAvailable={isAvailable}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToggleAvailabilityButton({
  agentId,
  date,
  isAvailable,
}: {
  agentId: string;
  date: string;
  isAvailable: boolean;
}) {
  const action = setAgentAvailabilityAction.bind(null, agentId);
  const [, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="is_available" value={String(!isAvailable)} />
      <button
        type="submit"
        disabled={isPending}
        className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
          isAvailable
            ? 'text-red-600 hover:bg-red-50'
            : 'text-green-600 hover:bg-green-50'
        } disabled:opacity-50`}
      >
        {isPending ? '…' : isAvailable ? 'Mark Off' : 'Mark Available'}
      </button>
    </form>
  );
}
