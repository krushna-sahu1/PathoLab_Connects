import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { sampleService } from '@/services/sample.service';
import { SampleStatusBadge } from '@/components/samples/sample-status-badge';
import { SampleStatusUpdateForm } from '@/components/samples/sample-status-update-form';
import { ReportForm } from '@/components/samples/report-form';
import { StatusTimeline } from '@/components/collections/status-timeline';
import { unwrapReport } from '@/services/sample.service';
import { ReportDownloadLink } from '@/components/samples/report-download-link';
import { isStorageObjectPath } from '@/lib/reports/storage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SampleDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'samples:write');
  const { id } = await params;

  let sample;
  try {
    sample = await sampleService.getSampleById(id);
  } catch {
    notFound();
  }

  const history = sample.sample_status_history ?? [];
  const report = unwrapReport(sample.reports);
  const collection = sample.collections;
  const patient = collection?.patients;
  const isComplete = sample.status === 'report_ready';

  // Reuse StatusTimeline but map sample_status_history shape
  const mappedHistory = history.map((h: import('@/types/sample').SampleStatusHistory) => ({
    id: h.id,
    new_status: h.new_status,
    previous_status: h.previous_status,
    created_at: h.created_at,
    remark: h.remark,
    changed_by: h.changed_by,
    collection_id: id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/samples" className="text-sm text-gray-500 hover:text-gray-700">← Samples</Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{sample.sample_id}</h2>
            <SampleStatusBadge status={sample.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Sample Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Patient</dt>
                <dd className="font-medium">
                  {patient ? (
                    <Link href={`/patients/${collection?.patients?.id}`} className="text-blue-600 hover:underline">
                      {patient.full_name}
                    </Link>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Collection</dt>
                <dd className="font-medium">
                  {collection ? (
                    <Link href={`/collections/${collection.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      {collection.collection_id}
                    </Link>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Collection Date</dt>
                <dd className="font-medium">{collection?.date ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Agent</dt>
                <dd className="font-medium">{collection?.agents?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Zone</dt>
                <dd className="font-medium">{collection?.zones?.name ?? '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Report card */}
          {report ? (
            <div className="bg-green-50 rounded-lg border border-green-200 p-5 space-y-3">
              <h3 className="font-semibold text-green-900">Report Ready ✅</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-green-700">Report Date</dt>
                  <dd className="font-medium text-green-900">{report.report_date}</dd>
                </div>
                {isStorageObjectPath(report.file_path) ? (
                  <div>
                    <dt className="text-green-700">Download</dt>
                    <dd>
                      <ReportDownloadLink
                        reportId={report.id}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View Report
                      </ReportDownloadLink>
                    </dd>
                  </div>
                ) : null}
                {report.lab_remarks && (
                  <div>
                    <dt className="text-green-700">Lab Remarks</dt>
                    <dd className="text-green-800">{report.lab_remarks}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-green-700">Delivered</dt>
                  <dd className="font-medium capitalize">{report.status}</dd>
                </div>
              </dl>
              {canWrite && report.status !== 'delivered' && (
                <Link
                  href={`/reports/${report.id}`}
                  className="block text-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Manage Report
                </Link>
              )}
            </div>
          ) : (
            canWrite && !isComplete && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <SampleStatusUpdateForm sampleId={id} currentStatus={sample.status} />
              </div>
            )
          )}

          {/* Add report if testing complete */}
          {canWrite && sample.status === 'testing' && !report && (
            <div className="bg-white rounded-lg border border-blue-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Upload Report</h3>
              <ReportForm sampleId={id} />
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <StatusTimeline history={mappedHistory as never} />
          </div>
        </div>
      </div>
    </div>
  );
}
