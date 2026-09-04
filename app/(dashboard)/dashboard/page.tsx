import { requireAuth } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';

async function getStats() {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().slice(0, 10);
    const [patientsRes, collectionsRes, inTransitRes, newRes, ticketsRes] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('collections').select('id', { count: 'exact', head: true }).eq('date', today).not('status', 'in', '(cancelled,rescheduled)'),
      supabase.from('samples').select('id', { count: 'exact', head: true }).eq('status', 'in_transit'),
      supabase.from('collections').select('id', { count: 'exact', head: true }).eq('status', 'new').is('agent_id', null),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'assigned', 'in_progress', 'waiting']),
    ]);
    return {
      patients: patientsRes.count ?? 0,
      collectionsToday: collectionsRes.count ?? 0,
      samplesInTransit: inTransitRes.count ?? 0,
      opsQueue: newRes.count ?? 0,
      openTickets: ticketsRes.count ?? 0,
    };
  } catch {
    return { patients: 0, collectionsToday: 0, samplesInTransit: 0, opsQueue: 0, openTickets: 0 };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const stats = await getStats();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-2xl font-semibold text-hp-ink">Operations Dashboard</h2>
        <p className="mt-1 text-sm text-hp-ink-muted">Welcome back, {user.full_name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <StatCard label="Patients" value={String(stats.patients)} icon="👤" href="/patients" />
        <StatCard label="Collections Today" value={String(stats.collectionsToday)} icon="🧪" href="/collections" />
        <StatCard label="Samples In Transit" value={String(stats.samplesInTransit)} icon="🔬" href="/samples" />
        <StatCard
          label="Ops Queue"
          value={String(stats.opsQueue)}
          icon="⚠️"
          href="/collections?status=new"
          highlight={stats.opsQueue > 0}
        />
        <StatCard
          label="Open Tickets"
          value={String(stats.openTickets)}
          icon="🎫"
          href="/tickets"
          highlight={stats.openTickets > 0}
        />
      </div>

      {stats.opsQueue > 0 && (
        <div className="rounded-2xl bg-hp-copper/10 border border-hp-copper/30 p-4">
          <p className="text-sm text-hp-ink">
            <strong>⚠ {stats.opsQueue} collection{stats.opsQueue !== 1 ? 's' : ''}</strong> in the operations queue need manual assignment.
            <Link href="/collections?status=new" className="ml-2 underline font-medium text-hp-copper-deep">View now →</Link>
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon, href, highlight,
}: {
  label: string;
  value: string;
  icon: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-5 min-h-[5.5rem] flex items-center gap-4 ${
        highlight
          ? 'bg-hp-copper/10 border-hp-copper/30'
          : 'bg-hp-paper border-hp-sand-2'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-hp-ink-muted">{label}</p>
        <p className={`text-xl font-bold ${highlight ? 'text-hp-copper-deep' : 'text-hp-ink'}`}>{value}</p>
      </div>
    </Link>
  );
}
