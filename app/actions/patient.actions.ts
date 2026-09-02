'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { patientService } from '@/services/patient.service';
import { createPatientSchema, updatePatientSchema, createAddressSchema } from '@/lib/validation/patient';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { firstZodMessage } from '@/lib/utils/zod';

export async function createPatientAction(formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin']);

  const raw = {
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    date_of_birth: (formData.get('date_of_birth') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    status: 'active' as const,
  };

  const parsed = createPatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  try {
    const patient = await patientService.createPatient(parsed.data, user.id);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'patient',
      resource_id: patient.id,
      new_values: parsed.data,
    });
    revalidatePath('/patients');
    redirect(`/patients/${patient.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create patient' };
  }
}

export async function updatePatientAction(id: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin']);

  const raw = {
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    date_of_birth: (formData.get('date_of_birth') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    status: formData.get('status') as 'active' | 'inactive',
  };

  const parsed = updatePatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  try {
    const patient = await patientService.updatePatient(id, parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'UPDATE',
      resource_type: 'patient',
      resource_id: id,
      new_values: parsed.data,
    });
    revalidatePath(`/patients/${id}`);
    revalidatePath('/patients');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update patient' };
  }
}

export async function addAddressAction(patientId: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin']);

  const raw = {
    label: formData.get('label') as string,
    full_address: formData.get('full_address') as string,
    area: (formData.get('area') as string) || undefined,
    sector: (formData.get('sector') as string) || undefined,
    pincode: formData.get('pincode') as string,
    is_primary: formData.get('is_primary') === 'true',
  };

  const parsed = createAddressSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  try {
    await patientService.addAddress(patientId, parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'ADD_ADDRESS',
      resource_type: 'patient',
      resource_id: patientId,
      new_values: parsed.data,
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to add address' };
  }
}

export async function deleteAddressAction(addressId: string, patientId: string) {
  const user = await requireRole(['super_admin', 'operations_admin']);
  try {
    await patientService.deleteAddress(addressId);
    await writeAuditLog({
      user_id: user.id,
      action: 'DELETE_ADDRESS',
      resource_type: 'patient',
      resource_id: patientId,
      new_values: { address_id: addressId },
    });
    revalidatePath(`/patients/${patientId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete address' };
  }
}
