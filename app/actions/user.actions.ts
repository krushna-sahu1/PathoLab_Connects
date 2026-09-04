'use server';

import { revalidatePath } from 'next/cache';
import { userService } from '@/services/user.service';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { canChangeUserRoles, canGrantRole, canManageUserAccount } from '@/lib/auth/permissions';
import { firstZodMessage } from '@/lib/utils/zod';
import { z } from 'zod';
import type { UserRole } from '@/types/auth';

const ROLES = [
  'super_admin',
  'operations_admin',
  'logistics_manager',
  'collection_agent',
  'support_agent',
  'viewer',
] as const;

const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  role: z.enum(ROLES),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function createUserAction(_prev: unknown, formData: FormData) {
  const actor = await requireRole(['super_admin', 'operations_admin']);
  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };
  if (!canGrantRole(actor.role, parsed.data.role)) {
    return { error: 'You cannot grant that role' };
  }

  try {
    const id = await userService.createUser(parsed.data);
    await writeAuditLog({
      user_id: actor.id,
      action: 'CREATE',
      resource_type: 'user',
      resource_id: id,
      new_values: { email: parsed.data.email, role: parsed.data.role },
    });
    revalidatePath('/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create user' };
  }
}

export async function updateUserRoleAction(userId: string, _prev: unknown, formData: FormData) {
  const actor = await requireAuth();
  const role = formData.get('role') as UserRole;
  if (!ROLES.includes(role)) return { error: 'Invalid role' };

  if (!canChangeUserRoles(actor.role) || !canGrantRole(actor.role, role)) {
    await writeAuditLog({
      user_id: actor.id,
      action: 'UPDATE_ROLE_DENIED',
      resource_type: 'user',
      resource_id: userId,
      new_values: { role, actor_role: actor.role },
    });
    return { error: 'Only Super Admin can change roles' };
  }

  try {
    const previous = await userService.getRole(userId);
    await userService.setRole(userId, role);
    await writeAuditLog({
      user_id: actor.id,
      action: 'UPDATE_ROLE',
      resource_type: 'user',
      resource_id: userId,
      old_values: previous ? { role: previous } : undefined,
      new_values: { role },
    });
    revalidatePath('/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update role' };
  }
}

export async function setUserActiveAction(userId: string, isActive: boolean) {
  const actor = await requireRole(['super_admin', 'operations_admin']);
  try {
    const targetRole = await userService.getRole(userId);
    if (targetRole && !canManageUserAccount(actor.role, targetRole)) {
      return { error: 'You cannot change the status of this account' };
    }
    await userService.setActive(userId, isActive);
    await writeAuditLog({
      user_id: actor.id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      resource_type: 'user',
      resource_id: userId,
    });
    revalidatePath('/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update user' };
  }
}
