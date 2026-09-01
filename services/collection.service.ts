import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { zoneService } from '@/services/zone.service';
import { agentService } from '@/services/agent.service';
import { generateCollectionId } from '@/lib/utils/ids';
import type { Collection, CollectionStatus, CollectionStatusHistory } from '@/types/collection';
import type { CreateCollectionInput } from '@/lib/validation/collection';

export const collectionService = {
  async getCollections({
    status,
    agentId,
    zoneId,
    date,
    patientId,
    page = 1,
    limit = 20,
  }: {
    status?: string;
    agentId?: string;
    zoneId?: string;
    date?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('collections')
      .select(
        '*, patients(id, full_name, phone), patient_addresses(id, full_address, area, sector, pincode), zones(id, name), agents(id, name, phone)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);
    if (agentId) query = query.eq('agent_id', agentId);
    if (zoneId) query = query.eq('zone_id', zoneId);
    if (date) query = query.eq('date', date);
    if (patientId) query = query.eq('patient_id', patientId);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { collections: (data ?? []) as CollectionWithDetails[], total: count ?? 0 };
  },

  async getCollectionById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select(
        '*, patients(id, full_name, phone, email), patient_addresses(*), zones(id, name), agents(id, name, phone), collection_status_history(*)'
      )
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as CollectionWithDetails & { collection_status_history: CollectionStatusHistory[] };
  },

  async getCollectionsByPatient(patientId: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*, zones(id, name), agents(id, name)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []) as CollectionWithDetails[];
  },

  async getCollectionsByAgent(agentId: string, date?: string) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('collections')
      .select('*, patients(id, full_name, phone), patient_addresses(id, full_address, area, sector, pincode)')
      .eq('agent_id', agentId)
      .not('status', 'in', '(cancelled,rescheduled)')
      .order('date', { ascending: true });
    if (date) query = query.eq('date', date);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as CollectionWithDetails[];
  },

  async getOperationsQueue() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*, patients(id, full_name, phone), patient_addresses(id, full_address, area, sector, pincode), zones(id, name)')
      .eq('status', 'new')
      .is('agent_id', null)
      .order('priority', { ascending: false })
      .order('date', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as CollectionWithDetails[];
  },

  async createCollection(input: CreateCollectionInput, createdBy?: string): Promise<CollectionWithDetails> {
    const admin = createAdminClient();
    const collection_id = generateCollectionId();

    // 1. Get address details for zone resolution
    const { data: address } = await admin
      .from('patient_addresses')
      .select('pincode, sector, area, zone_id')
      .eq('id', input.address_id)
      .single();

    // 2. Resolve zone
    let zoneId: string | null = address?.zone_id ?? null;
    if (!zoneId) {
      const zone = await zoneService.resolveZoneForAddress({
        pincode: address?.pincode,
        sector: address?.sector,
        area: address?.area,
      });
      zoneId = zone?.id ?? null;
    }

    // 3. Create collection in NEW status
    const { data: collection, error } = await admin
      .from('collections')
      .insert({
        collection_id,
        patient_id: input.patient_id,
        address_id: input.address_id,
        zone_id: zoneId,
        date: input.date,
        time_slot: input.time_slot,
        priority: input.priority,
        notes: input.notes || null,
        status: 'new',
        agent_id: null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // 4. Record initial status history
    await admin.from('collection_status_history').insert({
      collection_id: collection.id,
      previous_status: null,
      new_status: 'new',
      changed_by: createdBy ?? null,
      remark: 'Collection created',
    });

    // 5. Run assignment engine
    if (zoneId) {
      await collectionService.runAssignmentEngine(collection.id, zoneId, input.date, createdBy);
    }

    return collection as CollectionWithDetails;
  },

  /**
   * Assignment Engine
   * 1. Get zone's primary agent
   * 2. Check availability & capacity
   * 3. Fall back to backup agent
   * 4. Fall back to operations queue
   */
  async runAssignmentEngine(
    collectionId: string,
    zoneId: string,
    date: string,
    changedBy?: string
  ): Promise<{ assigned: boolean; agentId?: string; reason: string }> {
    const admin = createAdminClient();

    // Get zone with primary + backup agent
    const { data: zone } = await admin
      .from('zones')
      .select('id, name, primary_agent_id, backup_agent_id')
      .eq('id', zoneId)
      .single();

    if (!zone) return { assigned: false, reason: 'Zone not found' };

    const candidates = [
      zone.primary_agent_id,
      zone.backup_agent_id,
    ].filter(Boolean) as string[];

    for (const agentId of candidates) {
      const available = await agentService.isAgentAvailableForDate(agentId, date);
      if (!available) continue;

      // Assign agent
      await admin
        .from('collections')
        .update({ agent_id: agentId, status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', collectionId);

      // Increment agent load
      const { data: avail } = await admin
        .from('agent_availability')
        .select('id, current_load')
        .eq('agent_id', agentId)
        .eq('date', date)
        .single();

      if (avail) {
        await admin
          .from('agent_availability')
          .update({ current_load: (avail.current_load ?? 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', avail.id);
      } else {
        await admin.from('agent_availability').insert({
          agent_id: agentId,
          date,
          is_available: true,
          current_load: 1,
        });
      }

      // Record status history
      await admin.from('collection_status_history').insert({
        collection_id: collectionId,
        previous_status: 'new',
        new_status: 'assigned',
        changed_by: changedBy ?? null,
        remark: `Auto-assigned to agent ${agentId}`,
      });

      return { assigned: true, agentId, reason: 'Auto-assigned' };
    }

    // No agent available — stays in ops queue
    return { assigned: false, reason: 'No available agent — added to operations queue' };
  },

  async updateStatus(
    collectionId: string,
    newStatus: CollectionStatus,
    changedBy: string,
    remark?: string
  ) {
    const admin = createAdminClient();

    // Get current status
    const { data: current } = await admin
      .from('collections')
      .select('status, agent_id, date')
      .eq('id', collectionId)
      .single();

    if (!current) throw new Error('Collection not found');

    // If marking as failed/cancelled, decrement agent load
    if (['failed', 'cancelled'].includes(newStatus) && current.agent_id && current.date) {
      const { data: avail } = await admin
        .from('agent_availability')
        .select('id, current_load')
        .eq('agent_id', current.agent_id)
        .eq('date', current.date)
        .single();
      if (avail && avail.current_load > 0) {
        await admin
          .from('agent_availability')
          .update({ current_load: avail.current_load - 1, updated_at: new Date().toISOString() })
          .eq('id', avail.id);
      }
    }

    // Update collection
    const { data, error } = await admin
      .from('collections')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', collectionId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Record history
    await admin.from('collection_status_history').insert({
      collection_id: collectionId,
      previous_status: current.status,
      new_status: newStatus,
      changed_by: changedBy,
      remark: remark ?? null,
    });

    return data as Collection;
  },

  async manualAssign(collectionId: string, agentId: string, changedBy: string) {
    const admin = createAdminClient();
    const { data: col } = await admin
      .from('collections')
      .select('status, date')
      .eq('id', collectionId)
      .single();
    if (!col) throw new Error('Collection not found');

    const { data, error } = await admin
      .from('collections')
      .update({ agent_id: agentId, status: 'assigned', updated_at: new Date().toISOString() })
      .eq('id', collectionId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Increment agent load
    const { data: avail } = await admin
      .from('agent_availability')
      .select('id, current_load')
      .eq('agent_id', agentId)
      .eq('date', col.date)
      .single();

    if (avail) {
      await admin
        .from('agent_availability')
        .update({ current_load: (avail.current_load ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', avail.id);
    } else {
      await admin.from('agent_availability').insert({
        agent_id: agentId,
        date: col.date,
        is_available: true,
        current_load: 1,
      });
    }

    await admin.from('collection_status_history').insert({
      collection_id: collectionId,
      previous_status: col.status,
      new_status: 'assigned',
      changed_by: changedBy,
      remark: 'Manually assigned by operations',
    });

    return data as Collection;
  },
};

export type CollectionWithDetails = Collection & {
  patients?: { id: string; full_name: string; phone: string; email?: string } | null;
  patient_addresses?: { id: string; full_address: string; area?: string; sector?: string; pincode: string } | null;
  zones?: { id: string; name: string } | null;
  agents?: { id: string; name: string; phone: string } | null;
};
