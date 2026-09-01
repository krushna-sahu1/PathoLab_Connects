import { requireRole } from '@/lib/auth/session';
import { PatientForm } from '@/components/patients/patient-form';
import Link from 'next/link';

export default async function NewPatientPage() {
  await requireRole(['super_admin', 'operations_admin']);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="text-sm text-gray-500 hover:text-gray-700">← Patients</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">New Patient</h2>
      </div>
      <PatientForm />
    </div>
  );
}
