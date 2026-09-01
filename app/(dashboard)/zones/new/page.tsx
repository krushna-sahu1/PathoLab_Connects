import { requireRole } from '@/lib/auth/session';
import { ZoneForm } from '@/components/zones/zone-form';
import Link from 'next/link';

export default async function NewZonePage() {
  await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/zones" className="text-sm text-gray-500 hover:text-gray-700">← Zones</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">New Zone</h2>
      </div>
      <ZoneForm />
    </div>
  );
}
