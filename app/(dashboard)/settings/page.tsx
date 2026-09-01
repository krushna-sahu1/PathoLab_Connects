import { requireRole } from '@/lib/auth/session';

export default async function SettingsPage() {
  await requireRole(['super_admin', 'operations_admin']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Platform configuration</p>
      </div>
      <div className="rounded-lg bg-white border border-gray-200 p-8 text-center text-gray-400">
        Settings — Phase 1 shell
      </div>
    </div>
  );
}
