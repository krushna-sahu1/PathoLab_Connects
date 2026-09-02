import { describe, expect, it } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';

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
});
