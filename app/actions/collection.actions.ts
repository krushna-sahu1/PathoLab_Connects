'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { collectionService } from '@/services/collection.service';
import { createCollectionSchema, updateCollectionStatusSchema, reassignCollectionSchema } from '@/lib/validation/collection';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { firstZodMessage } from '@/lib/utils/zod';
import type { CollectionStatus } from '@/types/collection';

export async function createCollectionAction(_prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin']);

  const raw = {
    patient_id: formData.get('patient_id') as string,
    address_id: formData.get('address_id') as string,
    date: formData.get('date') as string,
    time_slot: formData.get('time_slot') as string,
    priority: (formData.get('priority') as string) || 'normal',
    notes: (formData.get('notes') as string) || undefined,
  };

  const parsed = createCollectionSchema.safeParse(raw);
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    const collection = await collectionService.createCollection(parsed.data, user.id);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'collection',
      resource_id: collection.id,
      new_values: parsed.data,
    });
    revalidatePath('/collections');
    revalidatePath('/dashboard');
    redirect(`/collections/${collection.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create collection' };
  }
}

export async function updateCollectionStatusAction(collectionId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    status: formData.get('status') as string,
    remark: (formData.get('remark') as string) || undefined,
    failure_reason: (formData.get('failure_reason') as string) || undefined,
  };

  const parsed = updateCollectionStatusSchema.safeParse(raw);
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  const remark = parsed.data.failure_reason
    ? `Failure reason: ${parsed.data.failure_reason}. ${parsed.data.remark ?? ''}`
    : parsed.data.remark;

  try {
    await collectionService.updateStatus(collectionId, parsed.data.status as CollectionStatus, user.id, remark);
    await writeAuditLog({
      user_id: user.id,
      action: 'STATUS_CHANGE',
      resource_type: 'collection',
      resource_id: collectionId,
      new_values: parsed.data,
    });
    revalidatePath(`/collections/${collectionId}`);
    revalidatePath('/collections');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update status' };
  }
}

export async function manualAssignAction(collectionId: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const parsed = reassignCollectionSchema.safeParse({ agent_id: formData.get('agent_id') });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await collectionService.manualAssign(collectionId, parsed.data.agent_id, user.id);
    await writeAuditLog({
      user_id: user.id,
      action: 'MANUAL_ASSIGN',
      resource_type: 'collection',
      resource_id: collectionId,
      new_values: parsed.data,
    });
    revalidatePath(`/collections/${collectionId}`);
    revalidatePath('/collections');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to assign agent' };
  }
}
