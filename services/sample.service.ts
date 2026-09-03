import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateSampleId } from '@/lib/utils/ids';
import type { Sample, SampleStatusHistory } from '@/types/sample';
import type { Report } from '@/types/report';
import type { CreateReportInput } from '@/lib/validation/sample';
import { notificationService } from '@/services/notification.service';
import { REPORTS_BUCKET } from '@/lib/reports/storage';

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
    time_slot?: string;
    patients?: { id: string; full_name: string; phone: string; email?: string } | null;
    agents?: { id: string; name: string; phone?: string } | null;
    zones?: { id: string; name: string } | null;
  } | null;
  reports?: Report | Report[] | null;
  sample_status_history?: SampleStatusHistory[];
};

export function unwrapReport(reports: Report | Report[] | null | undefined): Report | null {
  if (!reports) return null;
  return Array.isArray(reports) ? reports[0] ?? null : reports;
}

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
        '*, collections!inner(id, collection_id, date, patients(id, full_name, phone), agents(id, name), zones(id, name)), reports(id, report_date, status, file_path)',
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
      .maybeSingle();
    return data as (Sample & { reports?: Report | Report[] | null }) | null;
  },

  async getSamplesByPatient(patientId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('samples')
      .select(
        '*, collections!inner(id, collection_id, date, patient_id), reports(id, report_date, status, file_path)'
      )
      .eq('collections.patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []) as SampleWithDetails[];
  },

  async getLatestSampleForPatient(patientId: string) {
    const samples = await sampleService.getSamplesByPatient(patientId);
    return samples[0] ?? null;
  },

  async createFromCollection(collectionId: string, createdBy?: string): Promise<Sample> {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from('samples')
      .select('*')
      .eq('collection_id', collectionId)
      .maybeSingle();
    if (existing) return existing as Sample;

    const { data: collection } = await admin
      .from('collections')
      .select('id, patient_id')
      .eq('id', collectionId)
      .single();
    if (!collection) throw new Error('Collection not found');

    const sample_id = generateSampleId();
    const now = new Date().toISOString();

    const { data, error } = await admin
      .from('samples')
      .insert({
        sample_id,
        collection_id: collectionId,
        patient_id: collection.patient_id,
        status: 'collected',
        collected_at: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

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

    const extra: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'received_at_lab') {
      extra.received_at_lab = extra.updated_at;
    }

    const { data, error } = await admin
      .from('samples')
      .update({ status: newStatus, ...extra })
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

  async uploadReportPdf(sampleId: string, file: File): Promise<string> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Report file must be a PDF');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Report PDF must be 10 MB or smaller');
    }

    const admin = createAdminClient();
    const { data: sample } = await admin
      .from('samples')
      .select('id, patient_id')
      .eq('id', sampleId)
      .single();
    if (!sample?.patient_id) throw new Error('Sample not found');

    const path = `${sample.patient_id}/${sample.id}/${crypto.randomUUID()}.pdf`;
    const { error } = await admin.storage.from(REPORTS_BUCKET).upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return path;
  },

  async createReport(input: CreateReportInput, createdBy: string): Promise<Report> {
    const admin = createAdminClient();

    const { data: sample } = await admin
      .from('samples')
      .select('id, sample_id, patient_id, patients(full_name, phone)')
      .eq('id', input.sample_id)
      .single();
    if (!sample) throw new Error('Sample not found');

    const now = new Date().toISOString();
    const { data, error } = await admin
      .from('reports')
      .insert({
        patient_id: sample.patient_id,
        sample_id: input.sample_id,
        status: 'ready',
        file_path: input.file_path || null,
        report_date: input.report_date,
        report_ready_at: now,
        lab_remarks: input.lab_remarks || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await sampleService.updateStatus(input.sample_id, 'report_ready', createdBy, 'Report created');

    const patient = sample.patients as { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[] | null;
    const p = Array.isArray(patient) ? patient[0] : patient;
    if (p?.phone) {
      void notificationService.notifyReportReady(
        p.phone,
        p.full_name ?? 'there',
        sample.sample_id as string
      );
    }

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

  async getReportsByPatient(patientId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*, samples(id, sample_id)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async markReportDelivered(reportId: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('reports')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Report;
  },
};
