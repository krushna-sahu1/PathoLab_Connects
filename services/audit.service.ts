import { createServerSupabaseClient } from '@/lib/supabase/server';

export const auditService = {
  async list({
    action,
    resourceType,
    page = 1,
    limit = 50,
  }: {
    action?: string;
    resourceType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('audit_logs')
      .select('*, users(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (action) query = query.eq('action', action);
    if (resourceType) query = query.eq('resource_type', resourceType);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { logs: data ?? [], total: count ?? 0 };
  },
};
