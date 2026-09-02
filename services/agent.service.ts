import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAgentEligibleForAssignment } from '@/lib/logistics/assignment';
import type { Agent, AgentAvailability } from '@/types/agent';
import type { CreateAgentInput } from '@/lib/validation/agent';

export const agentService = {
  async getAgents({ includeInactive = false }: { includeInactive?: boolean } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('agents')
      .select('*, zones!agents_primary_zone_id_fkey(id, name)')
      .order('name');
    if (!includeInactive) {
      query = query.neq('status', 'inactive');
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as (Agent & { zones: { id: string; name: string } | null })[];
  },

  async getAgentById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('agents')
      .select('*, zones!agents_primary_zone_id_fkey(id, name)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Agent & { zones: { id: string; name: string } | null };
  },

  async createAgent(input: CreateAgentInput) {
    const admin = createAdminClient();
    const payload = {
      ...input,
      primary_zone_id: input.primary_zone_id || null,
      backup_zone_ids: input.backup_zone_ids ?? [],
    };
    const { data, error } = await admin
      .from('agents')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Agent;
  },

  async updateAgent(id: string, input: Partial<CreateAgentInput>) {
    const admin = createAdminClient();
    const payload: Record<string, unknown> = {
      ...input,
      updated_at: new Date().toISOString(),
    };
    if ('primary_zone_id' in input) {
      payload.primary_zone_id = input.primary_zone_id || null;
    }
    const { data, error } = await admin
      .from('agents')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Agent;
  },

  async updateAgentStatus(id: string, status: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('agents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Agent;
  },

  async getAvailability(agentId: string, date: string) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('agent_availability')
      .select('*')
      .eq('agent_id', agentId)
      .eq('date', date)
      .single();
    return data as AgentAvailability | null;
  },

  async getAvailabilityRange(agentId: string, fromDate: string, toDate: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('agent_availability')
      .select('*')
      .eq('agent_id', agentId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date');
    if (error) throw new Error(error.message);
    return (data ?? []) as AgentAvailability[];
  },

  async setAvailability(agentId: string, date: string, isAvailable: boolean) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('agent_availability')
      .upsert(
        { agent_id: agentId, date, is_available: isAvailable, current_load: 0 },
        { onConflict: 'agent_id,date' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AgentAvailability;
  },

  /**
   * Check if an agent is available for a given date.
   * Used by Phase 5 collection assignment engine.
   */
  async isAgentAvailableForDate(agentId: string, date: string): Promise<boolean> {
    const supabase = createAdminClient();

    // 1. Check agent is not inactive/on_leave
    const { data: agent } = await supabase
      .from('agents')
      .select('status, daily_capacity')
      .eq('id', agentId)
      .single();

    if (!agent) return false;

    const { data: avail } = await supabase
      .from('agent_availability')
      .select('is_available, current_load')
      .eq('agent_id', agentId)
      .eq('date', date)
      .maybeSingle();

    return isAgentEligibleForAssignment({
      status: agent.status,
      dailyCapacity: agent.daily_capacity,
      availability: avail
        ? { isAvailable: avail.is_available, currentLoad: avail.current_load }
        : null,
    });
  },
};
