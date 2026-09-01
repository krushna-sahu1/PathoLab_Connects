import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { patientService } from '@/services/patient.service';
import { PatientForm } from '@/components/patients/patient-form';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPatientPage({ params }: PageProps) {
  await requireRole(['super_admin', 'operations_admin']);
  const { id } = await params;

  let patient;
  try {
    patient = await patientService.getPatientById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/patients/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← {patient.full_name}</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">Edit Patient</h2>
      </div>
      <PatientForm patient={patient} />
    </div>
  );
}
