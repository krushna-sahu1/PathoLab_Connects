import type { CollectionStatus } from '@/types/collection';

const STYLES: Record<CollectionStatus, string> = {
  new: 'bg-hp-sand-2 text-hp-ink-muted',
  assigned: 'bg-hp-ink/10 text-hp-ink',
  accepted: 'bg-hp-ink text-hp-paper',
  on_the_way: 'bg-hp-copper/15 text-hp-copper-deep',
  arrived: 'bg-hp-copper text-hp-paper',
  collected: 'bg-hp-ink-soft text-hp-paper',
  failed: 'bg-hp-copper-deep text-hp-paper',
  cancelled: 'bg-hp-sand-2 text-hp-ink-muted',
  rescheduled: 'bg-hp-copper/20 text-hp-copper-deep',
};

const LABELS: Record<CollectionStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  accepted: 'Accepted',
  on_the_way: 'On The Way',
  arrived: 'Arrived',
  collected: 'Collected',
  failed: 'Failed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
};

export function AgentStatusChip({ status }: { status: CollectionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${STYLES[status] ?? 'bg-hp-sand-2 text-hp-ink-muted'}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

const DUTY_STYLES: Record<string, string> = {
  available: 'bg-hp-ink text-hp-paper',
  busy: 'bg-hp-copper text-hp-paper',
  offline: 'bg-hp-sand-2 text-hp-ink-muted',
  on_leave: 'bg-hp-copper/20 text-hp-copper-deep',
  inactive: 'bg-hp-ink-muted text-hp-paper',
};

const DUTY_LABELS: Record<string, string> = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
  on_leave: 'On Leave',
  inactive: 'Inactive',
};

export function AgentDutyChip({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${DUTY_STYLES[status] ?? 'bg-hp-sand-2 text-hp-ink-muted'}`}
    >
      {DUTY_LABELS[status] ?? status}
    </span>
  );
}
