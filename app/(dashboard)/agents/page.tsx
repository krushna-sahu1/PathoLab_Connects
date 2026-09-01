import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { agentService } from '@/services/agent.service';
import { AgentStatusBadge } from '@/components/agents/agent-status-badge';

export default async function AgentsPage() {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'agents:write');

  const agents = await agentService.getAgents({ includeInactive: true });

  const byStatus = {
    available: agents.filter((a) => a.status === 'available').length,
    busy: agents.filter((a) => a.status === 'busy').length,
    offline: agents.filter((a) => a.status === 'offline').length,
    on_leave: agents.filter((a) => a.status === 'on_leave').length,
    inactive: agents.filter((a) => a.status === 'inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agents</h2>
          <p className="mt-1 text-sm text-gray-500">{agents.length} agent{agents.length !== 1 ? 's' : ''} total</p>
        </div>
        {canWrite && (
          <Link
            href="/agents/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            + New Agent
          </Link>
        )}
      </div>

      {/* Status summary bar */}
      {agents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { label: 'Available', key: 'available', color: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Busy', key: 'busy', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Offline', key: 'offline', color: 'bg-gray-50 border-gray-200 text-gray-600' },
            { label: 'On Leave', key: 'on_leave', color: 'bg-orange-50 border-orange-200 text-orange-700' },
            { label: 'Inactive', key: 'inactive', color: 'bg-red-50 border-red-200 text-red-600' },
          ] as const).map(({ label, key, color }) => (
            <div key={key} className={`rounded-lg border px-4 py-3 ${color}`}>
              <p className="text-xs font-medium opacity-75">{label}</p>
              <p className="text-xl font-bold">{byStatus[key]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Agent table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary Zone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity/day</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No agents yet.
                  {canWrite && (
                    <Link href="/agents/new" className="ml-2 text-blue-600 hover:underline">Add your first agent</Link>
                  )}
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        {agent.email && <p className="text-xs text-gray-400">{agent.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{agent.phone}</td>
                  <td className="px-4 py-3">
                    <AgentStatusBadge status={agent.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.zones?.name ?? <span className="text-gray-300">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{agent.daily_capacity}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/agents/${agent.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
