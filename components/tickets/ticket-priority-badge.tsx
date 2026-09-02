import type { TicketPriority } from '@/types/ticket';

const STYLES: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority}
    </span>
  );
}
