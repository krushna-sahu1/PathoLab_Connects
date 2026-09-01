import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Patient, PatientAddress } from '@/types/patient';
import type { CreatePatientInput, CreateAddressInput } from '@/lib/validation/patient';
import { generatePatientId } from '@/lib/utils/ids';

export const patientService = {
  async getPatients({
    search,
    status,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,patient_id.ilike.%${search}%`
      );
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { patients: (data as Patient[]) ?? [], total: count ?? 0 };
  },

  async getPatientById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*, patient_addresses(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Patient & { patient_addresses: PatientAddress[] };
  },

  async createPatient(input: CreatePatientInput, createdBy?: string) {
    const admin = createAdminClient();
    const patient_id = generatePatientId();
    const { data, error } = await admin
      .from('patients')
      .insert({ ...input, patient_id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Patient;
  },

  async updatePatient(id: string, input: Partial<CreatePatientInput>) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('patients')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Patient;
  },

  async getAddresses(patientId: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('patient_addresses')
      .select('*')
      .eq('patient_id', patientId)
      .order('is_primary', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as PatientAddress[]) ?? [];
  },

  async addAddress(patientId: string, input: CreateAddressInput) {
    const admin = createAdminClient();
    // If this is primary, unset others first
    if (input.is_primary) {
      await admin
        .from('patient_addresses')
        .update({ is_primary: false })
        .eq('patient_id', patientId);
    }
    const { data, error } = await admin
      .from('patient_addresses')
      .insert({ ...input, patient_id: patientId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PatientAddress;
  },

  async updateAddress(addressId: string, patientId: string, input: Partial<CreateAddressInput>) {
    const admin = createAdminClient();
    if (input.is_primary) {
      await admin
        .from('patient_addresses')
        .update({ is_primary: false })
        .eq('patient_id', patientId);
    }
    const { data, error } = await admin
      .from('patient_addresses')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PatientAddress;
  },

  async deleteAddress(addressId: string) {
    const admin = createAdminClient();
    const { error } = await admin
      .from('patient_addresses')
      .delete()
      .eq('id', addressId);
    if (error) throw new Error(error.message);
  },
};
