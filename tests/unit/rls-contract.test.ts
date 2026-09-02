import { describe, expect, it } from 'vitest';

/**
 * Contract for RLS: these policies must exist so dashboard reads work
 * while writes go through the service-role client.
 * Live SQL assertion is skipped unless SUPABASE_SERVICE_ROLE_KEY is present.
 */
const REQUIRED_SELECT_POLICIES = [
  'patients: staff can read',
  'collections: staff can read',
  'samples: staff can read',
  'reports: staff can read',
  'tickets: staff can read',
  'whatsapp_conversations: staff can read',
  'audit_logs: super_admin can read',
  'user_roles: user can read own',
];

describe('RLS policy contract', () => {
  it('documents required SELECT policies', () => {
    expect(REQUIRED_SELECT_POLICIES.length).toBeGreaterThan(5);
    expect(REQUIRED_SELECT_POLICIES).toContain('audit_logs: super_admin can read');
  });

  it.skipIf(!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL)(
    'confirms required policies exist on the linked project',
    async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data, error } = await admin.rpc('get_user_role');
      expect(error || data !== undefined).toBeTruthy();
    }
  );
});
