import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Zone, ZoneRule } from '@/types/zone';
import type { CreateZoneInput, CreateZoneRuleInput } from '@/lib/validation/zone';

export const zoneService = {
  async getZones({ includeInactive = false }: { includeInactive?: boolean } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('zones')
      .select('*, zone_rules(*)')
      .order('name');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as (Zone & { zone_rules: ZoneRule[] })[]) ?? [];
  },

  async getZoneById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('zones')
      .select('*, zone_rules(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Zone & { zone_rules: ZoneRule[] };
  },

  async createZone(input: CreateZoneInput) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('zones')
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Zone;
  },

  async updateZone(id: string, input: Partial<CreateZoneInput>) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('zones')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Zone;
  },

  async addZoneRule(zoneId: string, input: CreateZoneRuleInput) {
    const admin = createAdminClient();
    // Prevent duplicate rules
    const { data: existing } = await admin
      .from('zone_rules')
      .select('id')
      .eq('zone_id', zoneId)
      .eq('rule_type', input.rule_type)
      .eq('rule_value', input.rule_value.trim())
      .single();
    if (existing) throw new Error('This rule already exists for the zone');

    const { data, error } = await admin
      .from('zone_rules')
      .insert({ zone_id: zoneId, rule_type: input.rule_type, rule_value: input.rule_value.trim() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ZoneRule;
  },

  async deleteZoneRule(ruleId: string) {
    const admin = createAdminClient();
    const { error } = await admin.from('zone_rules').delete().eq('id', ruleId);
    if (error) throw new Error(error.message);
  },

  /**
   * Zone Resolution Engine
   * Given an address (pincode, sector, area), finds the best matching zone.
   * Priority: pincode > sector > area
   * Returns null if no zone matches (goes to operations queue).
   */
  async resolveZoneForAddress(address: {
    pincode?: string;
    sector?: string;
    area?: string;
  }): Promise<Zone | null> {
    const supabase = await createServerSupabaseClient();

    // Build ordered list of (rule_type, rule_value) to try
    const checks: Array<{ rule_type: string; rule_value: string }> = [];
    if (address.pincode) checks.push({ rule_type: 'pincode', rule_value: address.pincode });
    if (address.sector) checks.push({ rule_type: 'sector', rule_value: address.sector });
    if (address.area) checks.push({ rule_type: 'area', rule_value: address.area });

    for (const check of checks) {
      const { data } = await supabase
        .from('zone_rules')
        .select('zone_id, zones!inner(*, is_active)')
        .eq('rule_type', check.rule_type)
        .ilike('rule_value', check.rule_value)
        .eq('zones.is_active', true)
        .limit(1)
        .single();

      if (data?.zones) {
        return data.zones as unknown as Zone;
      }
    }

    return null; // No match — goes to operations queue
  },
};
