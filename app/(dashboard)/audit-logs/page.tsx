import { requireRole } from '@/lib/auth/session';
import { auditService } from '@/services/audit.service';

interface PageProps {
  searchParams: Promise<{ action?: string; resource?: string; page?: string }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  await requireRole(['super_admin']);
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const { logs, total } = await auditService.list({
    action: params.action,
    resourceType: params.resource,
    page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-gray-500">{total} events</p>
      </div>

      <form method="GET" className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          name="action"
          defaultValue={params.action ?? ''}
          placeholder="Action (CREATE, UPDATE…)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="resource"
          defaultValue={params.resource ?? ''}
          placeholder="Resource (patient, ticket…)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium">Filter</button>
        <a href="/audit-logs" className="rounded-md px-4 py-2 text-sm text-gray-500">Clear</a>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">When</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resource</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No audit events yet</td>
              </tr>
            ) : (
              logs.map((log: {
                id: string;
                created_at: string;
                action: string;
                resource_type: string;
                resource_id?: string;
                new_values?: unknown;
                users?: { full_name?: string; email?: string };
              }) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">{log.users?.full_name ?? log.users?.email ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {log.resource_type}{log.resource_id ? ` / ${log.resource_id.slice(0, 8)}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {log.new_values ? JSON.stringify(log.new_values) : '—'}
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
