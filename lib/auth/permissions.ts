import type { UserRole } from '@/types/auth';

// Central permissions registry — do NOT scatter role checks in components
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  operations_admin: [
    'dashboard:read',
    'patients:read', 'patients:write',
    'zones:read', 'zones:write',
    'agents:read', 'agents:write',
    'collections:read', 'collections:write',
    'samples:read',
    'reports:read',
    'tickets:read', 'tickets:write',
    'users:read',
    'settings:read',
  ],
  logistics_manager: [
    'dashboard:read',
    'agents:read', 'agents:write',
    'collections:read', 'collections:write',
    'zones:read',
    'samples:read',
    'reports:read',
  ],
  collection_agent: [
    'dashboard:read',
    'collections:read_own', 'collections:write_own',
  ],
  support_agent: [
    'dashboard:read',
    'patients:read',
    'tickets:read', 'tickets:write',
  ],
  viewer: [
    'dashboard:read',
    'patients:read',
    'collections:read',
    'samples:read',
    'reports:read',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(permission);
}

export function requirePermission(role: UserRole, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Unauthorized: missing permission '${permission}'`);
  }
}
