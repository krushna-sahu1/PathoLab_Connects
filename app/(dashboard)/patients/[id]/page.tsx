import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { patientService } from '@/services/patient.service';
import { AddressList } from '@/components/patients/address-list';
import { AddressForm } from '@/components/patients/address-form';
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/patients" className="text-sm text-gray-500 hover:text-gray-700">← Patients</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Patient Details</h3>
              {canWrite && (
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Link>
              )}
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Patient ID</dt>
                <dd className="font-mono font-medium text-gray-900">{patient.patient_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{patient.phone}</dd>
              </div>
              {patient.email && (
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{patient.email}</dd>
                </div>
              )}
              {patient.date_of_birth && (
                <div>
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(patient.date_of_birth).toLocaleDateString('en-IN')}
                  </dd>
                </div>
              )}
              {patient.gender && (
                <div>
                  <dt className="text-gray-500">Gender</dt>
                  <dd className="font-medium text-gray-900 capitalize">{patient.gender}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      patient.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {patient.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Registered</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(patient.created_at).toLocaleDateString('en-IN')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <AddressList addresses={addresses} patientId={id} canWrite={canWrite} />

          {canWrite && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Add Address</h3>
              <AddressForm patientId={id} />
            </div>
          )}

          {/* Placeholder sections for future phases */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Collection History</h3>
            <p className="text-sm text-gray-400">Available in Phase 5</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Reports</h3>
            <p className="text-sm text-gray-400">Available in Phase 7</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Support Tickets</h3>
            <p className="text-sm text-gray-400">Available in Phase 8</p>
          </div>
        </div>
      </div>
    </div>
  );
}
