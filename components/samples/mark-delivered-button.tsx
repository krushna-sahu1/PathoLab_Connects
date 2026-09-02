'use client';

import { useTransition } from 'react';
import { markReportDeliveredAction } from '@/app/actions/sample.actions';

export function MarkDeliveredButton({ reportId, sampleId }: { reportId: string; sampleId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm('Mark this report as delivered to the patient?')) return;
    startTransition(async () => {
      await markReportDeliveredAction(reportId, sampleId);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? 'Marking…' : '✓ Mark as Delivered'}
    </button>
  );
}
