import { describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * These names must exist on the linked project (see supabase/migrations).
 * Writes go through the service-role client; dashboard reads use authenticated SELECT policies.
 */
export const REQUIRED_SELECT_POLICIES = [
  'patients: staff can read',
  'collections: staff can read',
  'samples: staff can read',
  'reports: staff can read',
  'tickets: staff can read',
  'whatsapp_conversations: staff can read',
  'audit_logs: super_admin can read',
  'user_roles: user can read own',
];

function requireLiveCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (process.env.CI === 'true' && (!url || !service || !anon)) {
    throw new Error(
      'CI must set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY so RLS tests run'
    );
  }
  return { url, service, anon, ready: Boolean(url && service && anon) };
}

describe('RLS policy contract', () => {
  it('documents required SELECT policies', () => {
    expect(REQUIRED_SELECT_POLICIES.length).toBeGreaterThan(5);
    expect(REQUIRED_SELECT_POLICIES).toContain('audit_logs: super_admin can read');
  });

  it.skipIf(!requireLiveCredentials().ready)(
    'confirms required policies exist and anonymous clients cannot read reports',
    async () => {
      const { url, service, anon } = requireLiveCredentials();
      const admin = createClient(url!, service!);
      const { data, error } = await admin.rpc('list_policy_names');
      expect(error).toBeNull();
      const names = (data as { policy_name: string }[] | null)?.map((row) => row.policy_name) ?? [];
      for (const required of REQUIRED_SELECT_POLICIES) {
        expect(names).toContain(required);
      }

      const publicClient = createClient(url!, anon!);
      const { data: leaked, error: anonError } = await publicClient.from('reports').select('id').limit(1);
      expect(anonError || !leaked?.length).toBeTruthy();
    }
  );
});
