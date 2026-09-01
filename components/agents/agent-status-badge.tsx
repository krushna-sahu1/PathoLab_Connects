import type { AgentStatus } from '@/types/agent';

const STATUS_STYLES: Record<AgentStatus, string> = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-600',
  on_leave: 'bg-orange-100 text-orange-700',
  inactive: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
  on_leave: 'On Leave',
  inactive: 'Inactive',
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
