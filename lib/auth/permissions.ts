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
    'samples:read', 'samples:write',
    'reports:read', 'reports:write',
    'tickets:read', 'tickets:write',
    'whatsapp:read',
    'users:read', 'users:write',
    'settings:read', 'settings:write',
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
    'whatsapp:read',
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

/** Higher number = more privilege. Equal ranks cannot grant each other. */
export const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  collection_agent: 2,
  support_agent: 2,
  logistics_manager: 3,
  operations_admin: 4,
  super_admin: 5,
};

export function canChangeUserRoles(actor: UserRole): boolean {
  return actor === 'super_admin';
}

/** Granting Super Admin requires being Super Admin. All other grants must be strictly below the actor. */
export function canGrantRole(actor: UserRole, granted: UserRole): boolean {
  if (granted === 'super_admin') return actor === 'super_admin';
  return ROLE_RANK[granted] < ROLE_RANK[actor];
}

export function canManageUserAccount(actor: UserRole, target: UserRole): boolean {
  return ROLE_RANK[target] < ROLE_RANK[actor];
}
