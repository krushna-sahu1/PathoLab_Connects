import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { patientService } from '@/services/patient.service';
import { collectionService } from '@/services/collection.service';
import { sampleService } from '@/services/sample.service';
import { ticketService } from '@/services/ticket.service';
import { AddressList } from '@/components/patients/address-list';
import { AddressForm } from '@/components/patients/address-form';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';
import { SampleStatusBadge } from '@/components/samples/sample-status-badge';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'patients:write');
  const { id } = await params;

  let patient;
  try {
    patient = await patientService.getPatientById(id);
  } catch {
    notFound();
  }

  const addresses = patient.patient_addresses ?? [];
  const collections = await collectionService.getCollectionsByPatient(id);
  const samples = await sampleService.getSamplesByPatient(id);
  const reports = await sampleService.getReportsByPatient(id);
  const tickets = await ticketService.getTicketsByPatient(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="text-sm text-gray-500 hover:text-gray-700">← Patients</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Patient Details</h3>
              {canWrite && (
                <Link href={`/patients/${id}/edit`} className="text-sm text-blue-600 hover:text-blue-700">Edit</Link>
              )}
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Patient ID</dt><dd className="font-mono font-medium">{patient.patient_id}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{patient.phone}</dd></div>
              {patient.email && <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{patient.email}</dd></div>}
              {patient.date_of_birth && <div><dt className="text-gray-500">DOB</dt><dd className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString('en-IN')}</dd></div>}
              {patient.gender && <div><dt className="text-gray-500">Gender</dt><dd className="font-medium capitalize">{patient.gender}</dd></div>}
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{patient.status}</span></dd>
              </div>
              <div><dt className="text-gray-500">Registered</dt><dd className="font-medium">{new Date(patient.created_at).toLocaleDateString('en-IN')}</dd></div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AddressList addresses={addresses} patientId={id} canWrite={canWrite} />
          {canWrite && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Add Address</h3>
              <AddressForm patientId={id} />
            </div>
          )}

          {/* Collection History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Collection History</h3>
              {hasPermission(user.role, 'collections:write') && (
                <Link href={`/collections/new?patient_id=${id}`} className="text-sm text-blue-600 hover:underline">+ Book Collection</Link>
              )}
            </div>
            {collections.length === 0 ? (
              <p className="text-sm text-gray-400">No collections yet</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Agent</th>
                    <th className="pb-2">Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collections.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 font-mono text-xs text-gray-500">{c.collection_id}</td>
                      <td className="py-2">{c.date} <span className="text-gray-400 text-xs">{c.time_slot}</span></td>
                      <td className="py-2 text-gray-600">{c.agents?.name ?? '—'}</td>
                      <td className="py-2"><CollectionStatusBadge status={c.status} /></td>
                      <td className="py-2 text-right"><Link href={`/collections/${c.id}`} className="text-blue-600 text-xs hover:underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Samples</h3>
            {samples.length === 0 ? (
              <p className="text-sm text-gray-400">No samples yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {samples.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <Link href={`/samples/${s.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {s.sample_id}
                    </Link>
                    <SampleStatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Reports</h3>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-400">No reports yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {reports.map((r: { id: string; status: string; report_date?: string; samples?: { sample_id?: string } }) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <Link href={`/reports/${r.id}`} className="text-blue-600 hover:underline">
                      {r.samples?.sample_id ?? 'Report'} — {r.report_date ?? 'n/a'}
                    </Link>
                    <span className="text-xs capitalize text-gray-500">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Support Tickets</h3>
              {hasPermission(user.role, 'tickets:write') && (
                <Link href={`/tickets/new?patient_id=${id}`} className="text-sm text-blue-600 hover:underline">+ New Ticket</Link>
              )}
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm text-gray-400">No tickets yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {tickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <Link href={`/tickets/${t.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {t.ticket_id}
                    </Link>
                    <TicketStatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
