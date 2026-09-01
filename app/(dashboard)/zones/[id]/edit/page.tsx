import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { zoneService } from '@/services/zone.service';
import { ZoneForm } from '@/components/zones/zone-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: PageProps) {
  await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);
  const { id } = await params;

  let zone;
  try {
    zone = await zoneService.getZoneById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/zones/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← {zone.name}</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">Edit Zone</h2>
      </div>
      <ZoneForm zone={zone} />
    </div>
  );
}
