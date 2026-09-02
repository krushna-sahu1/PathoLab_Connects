import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AppSettings {
  org_name: string;
  support_phone: string | null;
  updated_at?: string;
}

const DEFAULTS: AppSettings = {
  org_name: 'Hypatho Connects',
  support_phone: null,
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
    if (!data) return DEFAULTS;
    return {
      org_name: data.org_name ?? DEFAULTS.org_name,
      support_phone: data.support_phone ?? null,
      updated_at: data.updated_at,
    };
  },

  async update(input: AppSettings, updatedBy: string) {
    const admin = createAdminClient();
    const { error } = await admin.from('app_settings').upsert({
      id: 1,
      org_name: input.org_name,
      support_phone: input.support_phone || null,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    });
    if (error) throw new Error(error.message);
  },
};
