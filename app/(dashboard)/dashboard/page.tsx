import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operations Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.full_name}
        </p>
      </div>

      {/* Stats grid — Phase 5+ will populate with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients" value="—" icon="👤" />
        <StatCard label="Collections Today" value="—" icon="🧪" />
        <StatCard label="Samples In Transit" value="—" icon="🔬" />
        <StatCard label="Open Tickets" value="—" icon="🎫" />
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-700">
          <strong>Phase 1 complete.</strong> Authentication, RBAC, and dashboard shell are live.
          Data will populate as each phase is implemented.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
