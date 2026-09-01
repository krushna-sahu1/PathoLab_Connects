import { requireAuth } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function getStats() {
  try {
    const supabase = await createServerSupabaseClient();
    const [patientsRes] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
    ]);
    return {
      patients: patientsRes.count ?? 0,
    };
  } catch {
    return { patients: 0 };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operations Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients" value={String(stats.patients)} icon="👤" href="/patients" />
        <StatCard label="Collections Today" value="—" icon="🧪" href="/collections" />
        <StatCard label="Samples In Transit" value="—" icon="🔬" href="/samples" />
        <StatCard label="Open Tickets" value="—" icon="🎫" href="/tickets" />
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-700">
          <strong>Phase 2 complete.</strong> Patient management is live — create, view, and manage patients and their addresses.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, href,
}: {
  label: string;
  value: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </a>
  );
}
