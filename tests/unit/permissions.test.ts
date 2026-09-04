import { describe, expect, it } from 'vitest';
import {
  canChangeUserRoles,
  canGrantRole,
  canManageUserAccount,
  hasPermission,
  ROLE_PERMISSIONS,
} from '@/lib/auth/permissions';

describe('RBAC permissions', () => {
  it('gives super_admin every permission via wildcard', () => {
    expect(hasPermission('super_admin', 'users:write')).toBe(true);
    expect(hasPermission('super_admin', 'audit:read')).toBe(true);
    expect(ROLE_PERMISSIONS.super_admin).toEqual(['*']);
  });

  it('lets operations manage patients, collections, tickets, and users', () => {
    expect(hasPermission('operations_admin', 'patients:write')).toBe(true);
    expect(hasPermission('operations_admin', 'collections:write')).toBe(true);
    expect(hasPermission('operations_admin', 'tickets:write')).toBe(true);
    expect(hasPermission('operations_admin', 'users:write')).toBe(true);
    expect(hasPermission('operations_admin', 'audit:read')).toBe(false);
  });

  it('restricts collection agents to their own work', () => {
    expect(hasPermission('collection_agent', 'collections:read_own')).toBe(true);
    expect(hasPermission('collection_agent', 'patients:write')).toBe(false);
    expect(hasPermission('collection_agent', 'tickets:write')).toBe(false);
  });

  it('lets support agents handle tickets but not logistics writes', () => {
    expect(hasPermission('support_agent', 'tickets:write')).toBe(true);
    expect(hasPermission('support_agent', 'patients:read')).toBe(true);
    expect(hasPermission('support_agent', 'zones:write')).toBe(false);
  });

  it('allows only super_admin to change roles', () => {
    expect(canChangeUserRoles('super_admin')).toBe(true);
    expect(canChangeUserRoles('operations_admin')).toBe(false);
    expect(canChangeUserRoles('logistics_manager')).toBe(false);
  });

  it('blocks granting Super Admin unless the actor is Super Admin', () => {
    expect(canGrantRole('operations_admin', 'super_admin')).toBe(false);
    expect(canGrantRole('logistics_manager', 'super_admin')).toBe(false);
    expect(canGrantRole('super_admin', 'super_admin')).toBe(true);
  });

  it('blocks granting a role equal to or above the actor', () => {
    expect(canGrantRole('operations_admin', 'operations_admin')).toBe(false);
    expect(canGrantRole('operations_admin', 'logistics_manager')).toBe(true);
    expect(canGrantRole('operations_admin', 'viewer')).toBe(true);
    expect(canManageUserAccount('operations_admin', 'super_admin')).toBe(false);
    expect(canManageUserAccount('operations_admin', 'operations_admin')).toBe(false);
    expect(canManageUserAccount('operations_admin', 'viewer')).toBe(true);
  });
});
