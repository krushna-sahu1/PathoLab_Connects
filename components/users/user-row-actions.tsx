'use client';

import { useActionState, useTransition } from 'react';
import { setUserActiveAction, updateUserRoleAction } from '@/app/actions/user.actions';
import type { UserRole } from '@/types/auth';

const ROLES: UserRole[] = [
  'super_admin',
  'operations_admin',
  'logistics_manager',
  'collection_agent',
  'support_agent',
  'viewer',
];

export function UserRowActions({
  userId,
  role,
  isActive,
  canChangeRole,
}: {
  userId: string;
  role: UserRole;
  isActive: boolean;
  canChangeRole: boolean;
}) {
  const action = updateUserRoleAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(action, null);
  const [toggling, startToggle] = useTransition();

  return (
    <div className="flex items-center gap-2 justify-end">
      {canChangeRole ? (
        <form action={formAction}>
          <select
            name="role"
            defaultValue={role}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </form>
      ) : null}
      <button
        type="button"
        disabled={toggling}
        onClick={() => {
          startToggle(() => {
            void setUserActiveAction(userId, !isActive);
          });
        }}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </div>
  );
}
