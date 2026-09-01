import { requireRole } from '@/lib/auth/session';
import { patientService } from '@/services/patient.service';
import { CollectionForm } from '@/components/collections/collection-form';
import Link from 'next/link';

export default async function NewCollectionPage() {
  await requireRole(['super_admin', 'operations_admin']);
  const { patients } = await patientService.getPatients({ limit: 200 });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/collections" className="text-sm text-gray-500 hover:text-gray-700">← Collections</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">New Collection</h2>
      </div>
      <CollectionForm patients={patients} />
    </div>
  );
}
