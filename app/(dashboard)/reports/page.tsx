import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { sampleService } from '@/services/sample.service';

export default async function ReportsPage() {
  await requireAuth();
  const { reports, total } = await sampleService.getReports();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="mt-1 text-sm text-gray-500">{total} report{total !== 1 ? 's' : ''} total</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sample</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Report Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No reports yet</td>
              </tr>
            ) : (
              reports.map((report: any) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {report.samples?.sample_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {report.samples?.collections?.patients?.full_name ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{report.report_date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      report.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : report.status === 'ready'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status ?? 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/reports/${report.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
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
