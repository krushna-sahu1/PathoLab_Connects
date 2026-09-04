import { requireRole } from '@/lib/auth/session';
import { userService } from '@/services/user.service';
import { canChangeUserRoles } from '@/lib/auth/permissions';
import { CreateUserForm } from '@/components/users/create-user-form';
import { UserRowActions } from '@/components/users/user-row-actions';

export default async function UsersPage() {
  const actor = await requireRole(['super_admin', 'operations_admin']);
  const users = await userService.listUsers();
  const canChangeRole = canChangeUserRoles(actor.role);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="mt-1 text-sm text-gray-500">Staff accounts and roles</p>
      </div>

      <CreateUserForm actorRole={actor.role} />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 capitalize text-gray-700">{u.role.replaceAll('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UserRowActions userId={u.id} role={u.role} isActive={u.is_active} canChangeRole={canChangeRole} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
