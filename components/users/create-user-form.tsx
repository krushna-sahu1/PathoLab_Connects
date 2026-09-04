'use client';

import { useActionState } from 'react';
import { createUserAction } from '@/app/actions/user.actions';
import { canGrantRole } from '@/lib/auth/permissions';
import type { UserRole } from '@/types/auth';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'operations_admin', label: 'Operations Admin' },
  { value: 'logistics_manager', label: 'Logistics Manager' },
  { value: 'collection_agent', label: 'Collection Agent' },
  { value: 'support_agent', label: 'Support Agent' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function CreateUserForm({ actorRole }: { actorRole: UserRole }) {
  const [state, formAction, isPending] = useActionState(createUserAction, null);
  const roles = ROLE_OPTIONS.filter((r) => canGrantRole(actorRole, r.value));

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Add staff user</h3>
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">User created.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="full_name" required placeholder="Full name" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <select name="role" required className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <input name="password" type="password" required minLength={8} placeholder="Temporary password" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {isPending ? 'Creating…' : 'Create user'}
      </button>
    </form>
  );
}
