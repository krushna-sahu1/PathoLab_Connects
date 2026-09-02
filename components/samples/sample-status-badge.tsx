import type { SampleStatus } from '@/services/sample.service';

const STYLES: Record<SampleStatus, string> = {
  collected: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  received_at_lab: 'bg-purple-100 text-purple-700',
  accepted: 'bg-violet-100 text-violet-700',
  processing: 'bg-amber-100 text-amber-700',
  testing: 'bg-orange-100 text-orange-700',
  report_ready: 'bg-green-100 text-green-700',
};

const LABELS: Record<SampleStatus, string> = {
  collected: 'Collected',
  in_transit: 'In Transit',
  received_at_lab: 'At Lab',
  accepted: 'Accepted',
  processing: 'Processing',
  testing: 'Testing',
  report_ready: 'Report Ready',
};

export function SampleStatusBadge({ status }: { status: SampleStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
