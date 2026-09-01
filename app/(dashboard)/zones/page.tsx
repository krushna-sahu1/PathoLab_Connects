import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { zoneService } from '@/services/zone.service';

export default async function ZonesPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'zones:write');

  const zones = await zoneService.getZones({ includeInactive: true });
  const active = zones.filter((z) => z.is_active);
  const inactive = zones.filter((z) => !z.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zones</h2>
          <p className="mt-1 text-sm text-gray-500">
            {active.length} active zone{active.length !== 1 ? 's' : ''}
            {inactive.length > 0 && ` · ${inactive.length} inactive`}
          </p>
        </div>
        {canWrite && (
          <Link
            href="/zones/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            + New Zone
          </Link>
        )}
      </div>

      {/* Zone grid */}
      {zones.length === 0 ? (
        <div className="rounded-lg bg-white border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No zones yet. Create your first zone to start managing logistics.</p>
          {canWrite && (
            <Link href="/zones/new" className="mt-4 inline-block text-blue-600 text-sm font-medium hover:underline">
              Create Zone
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <Link
              key={zone.id}
              href={`/zones/${zone.id}`}
              className={`block rounded-lg border p-5 transition-all hover:shadow-sm ${
                zone.is_active
                  ? 'bg-white border-gray-200 hover:border-blue-300'
                  : 'bg-gray-50 border-gray-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{zone.name}</h3>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        zone.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {zone.description && (
                    <p className="mt-1 text-sm text-gray-500 truncate">{zone.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Rules</p>
                  <p className="text-sm font-semibold text-gray-700">{zone.zone_rules?.length ?? 0}</p>
                </div>
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Daily capacity</p>
                  <p className="text-sm font-semibold text-gray-700">{zone.daily_capacity}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
