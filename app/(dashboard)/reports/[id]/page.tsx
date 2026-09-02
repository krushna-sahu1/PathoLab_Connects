import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { sampleService } from '@/services/sample.service';
import { MarkDeliveredButton } from '@/components/samples/mark-delivered-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'reports:write');
  const { id } = await params;

  let report;
  try {
    report = await sampleService.getReportById(id);
  } catch {
    notFound();
  }

  const sample = report?.samples;
  const collection = sample?.collections;
  const patient = collection?.patients;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="text-sm text-gray-500 hover:text-gray-700">← Reports</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">Report Detail</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Report Information</h3>
          {report.status === 'delivered' ? (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">
              ✅ Delivered
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
              ⏳ Pending Delivery
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Patient</dt>
            <dd className="font-medium">
              {patient ? (
                <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">
                  {patient.full_name}
                </Link>
              ) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="font-medium">{patient?.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Sample ID</dt>
            <dd className="font-mono font-medium text-xs">{sample?.sample_id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Collection ID</dt>
            <dd>
              {collection ? (
                <Link href={`/collections/${collection.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                  {collection.collection_id}
                </Link>
              ) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Report Date</dt>
            <dd className="font-semibold">{new Date(report.report_date).toLocaleDateString('en-IN')}</dd>
          </div>
          {report.lab_remarks && (
            <div className="md:col-span-2">
              <dt className="text-gray-500">Lab Remarks</dt>
              <dd className="text-gray-800">{report.lab_remarks}</dd>
            </div>
          )}
        </dl>

        {report.file_path && (
          <a
            href={report.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            📄 Download Report
          </a>
        )}

        {canWrite && report.status !== 'delivered' && (
          <MarkDeliveredButton reportId={id} sampleId={sample?.id ?? ''} />
        )}
      </div>
    </div>
  );
}
