import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSampleId } from '@/lib/utils/ids';
import type { Sample, SampleStatusHistory } from '@/types/sample';
import type { Report } from '@/types/report';
import type { CreateReportInput } from '@/lib/validation/sample';

export type SampleStatus =
  | 'collected'
  | 'in_transit'
  | 'received_at_lab'
  | 'accepted'
  | 'processing'
  | 'testing'
  | 'report_ready';

export type SampleWithDetails = Sample & {
  collections?: {
    id: string;
    collection_id: string;
    date: string;
    patients?: { id: string; full_name: string; phone: string } | null;
    agents?: { id: string; name: string } | null;
    zones?: { id: string; name: string } | null;
  } | null;
  reports?: Report | null;
  sample_status_history?: SampleStatusHistory[];
};

export const sampleService = {
  async getSamples({
    status,
    page = 1,
    limit = 20,
  }: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('samples')
      .select(
        '*, collections!inner(id, collection_id, date, patients(id, full_name, phone), agents(id, name), zones(id, name)), reports(id, report_date, is_delivered)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { samples: (data ?? []) as SampleWithDetails[], total: count ?? 0 };
  },

  async getSampleById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('samples')
      .select(
        '*, collections!inner(id, collection_id, date, time_slot, patients(id, full_name, phone, email), agents(id, name, phone), zones(id, name)), reports(*), sample_status_history(*)'
      )
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as SampleWithDetails;
  },

  async getSampleByCollectionId(collectionId: string) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('samples')
      .select('*, reports(*)')
      .eq('collection_id', collectionId)
      .single();
    return data as (Sample & { reports?: Report | null }) | null;
  },

  async getSamplesByPatient(patientId: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('samples')
      .select(
        '*, collections!inner(id, collection_id, date, patient_id), reports(id, report_date, is_delivered, report_url)'
      )
      .eq('collections.patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []) as SampleWithDetails[];
  },

  /**
   * Auto-create a sample when collection reaches 'collected' status.
   * Called by the collection service.
   */
  async createFromCollection(collectionId: string, createdBy?: string): Promise<Sample> {
    const admin = createAdminClient();
    const sample_id = generateSampleId();

    const { data, error } = await admin
      .from('samples')
      .insert({
        sample_id,
        collection_id: collectionId,
        status: 'collected',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Record initial status
    await admin.from('sample_status_history').insert({
      sample_id: data.id,
      previous_status: null,
      new_status: 'collected',
      changed_by: createdBy ?? null,
      remark: 'Sample created from collection',
    });

    return data as Sample;
  },

  async updateStatus(
    sampleId: string,
    newStatus: SampleStatus,
    changedBy: string,
    remark?: string
  ) {
    const admin = createAdminClient();

    const { data: current } = await admin
      .from('samples')
      .select('status')
      .eq('id', sampleId)
      .single();

    if (!current) throw new Error('Sample not found');

    const { data, error } = await admin
      .from('samples')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sampleId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await admin.from('sample_status_history').insert({
      sample_id: sampleId,
      previous_status: current.status,
      new_status: newStatus,
      changed_by: changedBy,
      remark: remark ?? null,
    });

    return data as Sample;
  },

  // --- Reports ---

  async createReport(input: CreateReportInput, createdBy: string): Promise<Report> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('reports')
      .insert({
        ...input,
        report_url: input.report_url || null,
        lab_remarks: input.lab_remarks || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auto-advance sample to report_ready
    await sampleService.updateStatus(input.sample_id, 'report_ready', createdBy, 'Report created');

    return data as Report;
  },

  async getReportById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*, samples!inner(*, collections!inner(*, patients(id, full_name, phone)))')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getReports({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { data, error, count } = await supabase
      .from('reports')
      .select(
        '*, samples!inner(id, sample_id, collections!inner(id, collection_id, patients(id, full_name, phone)))',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(error.message);
    return { reports: data ?? [], total: count ?? 0 };
  },

  async markReportDelivered(reportId: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('reports')
      .update({ is_delivered: true, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Report;
  },
};
