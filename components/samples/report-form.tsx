'use client';

import { useActionState } from 'react';
import { createReportAction } from '@/app/actions/sample.actions';

export function ReportForm({ sampleId }: { sampleId: string }) {
  const [state, formAction, isPending] = useActionState(createReportAction, null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <input type="hidden" name="sample_id" value={sampleId} />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Report Date *</label>
        <input
          name="report_date"
          type="date"
          required
          defaultValue={today}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Report URL</label>
        <input
          name="report_url"
          type="url"
          placeholder="https://storage.example.com/report.pdf"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">Link to the report PDF (Supabase Storage or external URL)</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Lab Remarks</label>
        <textarea
          name="lab_remarks"
          rows={2}
          placeholder="Optional notes from the lab…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving Report…' : 'Save Report & Mark Ready'}
      </button>
    </form>
  );
}
