import { requireRole } from '@/lib/auth/session';

export default async function AuditLogsPage() {
  await requireRole(['super_admin']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-gray-500">Track all important administrative actions</p>
      </div>
      <div className="rounded-lg bg-white border border-gray-200 p-8 text-center text-gray-400">
        Audit log viewer — Phase 1 shell
      </div>
    </div>
  );
}
