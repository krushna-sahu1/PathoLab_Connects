import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { patientService } from '@/services/patient.service';
import { PatientTable } from '@/components/patients/patient-table';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function PatientsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'patients:write');
  const params = await searchParams;

  const page = parseInt(params.page ?? '1', 10);
  const { patients, total } = await patientService.getPatients({
    search: params.search,
    status: params.status,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="mt-1 text-sm text-gray-500">
            {total} patient{total !== 1 ? 's' : ''} total
          </p>
        </div>
        {canWrite && (
          <Link
            href="/patients/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            + New Patient
          </Link>
        )}
      </div>

      <PatientTable
        patients={patients}
        total={total}
        page={page}
        canWrite={canWrite}
      />
    </div>
  );
}
