import type { UserRole } from '@/types/auth';

// TODO Phase 1 — Full RBAC implementation
// Central permissions registry — do NOT scatter role checks in components

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  operations_admin: [
    'patients:read', 'patients:write',
    'zones:read', 'zones:write',
    'agents:read', 'agents:write',
    'collections:read', 'collections:write',
    'samples:read', 'tickets:read', 'tickets:write',
  ],
  logistics_manager: [
    'agents:read', 'agents:write',
    'collections:read', 'collections:write',
    'zones:read',
  ],
  collection_agent: [
    'collections:read_own', 'collections:write_own',
  ],
  support_agent: [
    'patients:read',
    'tickets:read', 'tickets:write',
  ],
  viewer: [
    'patients:read', 'collections:read', 'samples:read',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}
