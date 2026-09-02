import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { sampleService } from '@/services/sample.service';
import { SampleStatusBadge } from '@/components/samples/sample-status-badge';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'collected', label: 'Collected' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'received_at_lab', label: 'Received at Lab' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'processing', label: 'Processing' },
  { value: 'testing', label: 'Testing' },
  { value: 'report_ready', label: 'Report Ready' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function SamplesPage({ searchParams }: PageProps) {
  await requireAuth();
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const { samples, total } = await sampleService.getSamples({
    status: params.status,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Samples</h2>
          <p className="mt-1 text-sm text-gray-500">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Filter
        </button>
        <a href="/samples" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</a>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sample ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Collection Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Report</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {samples.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No samples found</td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{sample.sample_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{sample.collections?.patients?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{sample.collections?.patients?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{sample.collections?.date ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{sample.collections?.agents?.name ?? '—'}</td>
                  <td className="px-4 py-3"><SampleStatusBadge status={sample.status} /></td>
                  <td className="px-4 py-3">
                    {sample.reports ? (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                        {sample.reports.is_delivered ? 'Delivered' : 'Ready'}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">No report</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/samples/${sample.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
