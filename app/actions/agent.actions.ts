'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { agentService } from '@/services/agent.service';
import { createAgentSchema, updateAgentStatusSchema } from '@/lib/validation/agent';
import { requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { firstZodMessage } from '@/lib/utils/zod';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

export async function createAgentAction(_prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const workingDays = DAYS.filter((d) => formData.get(`day_${d}`) === 'on');

  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    status: 'available' as const,
    primary_zone_id: (formData.get('primary_zone_id') as string) || undefined,
    backup_zone_ids: [],
    daily_capacity: formData.get('daily_capacity') as string,
    working_days: workingDays,
  };

  const parsed = createAgentSchema.safeParse(raw);
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    const agent = await agentService.createAgent(parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'agent',
      resource_id: agent.id,
      new_values: parsed.data,
    });
    revalidatePath('/agents');
    redirect(`/agents/${agent.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create agent' };
  }
}

export async function updateAgentAction(id: string, _prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const workingDays = DAYS.filter((d) => formData.get(`day_${d}`) === 'on');

  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    status: formData.get('status') as string,
    primary_zone_id: (formData.get('primary_zone_id') as string) || undefined,
    daily_capacity: formData.get('daily_capacity') as string,
    working_days: workingDays,
  };

  const parsed = createAgentSchema.safeParse(raw);
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await agentService.updateAgent(id, parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'UPDATE',
      resource_type: 'agent',
      resource_id: id,
      new_values: parsed.data,
    });
    revalidatePath(`/agents/${id}`);
    revalidatePath('/agents');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update agent' };
  }
}

export async function updateAgentStatusAction(id: string, _prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const parsed = updateAgentStatusSchema.safeParse({ status: formData.get('status') });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await agentService.updateAgentStatus(id, parsed.data.status);
    await writeAuditLog({
      user_id: user.id,
      action: 'STATUS_CHANGE',
      resource_type: 'agent',
      resource_id: id,
      new_values: parsed.data,
    });
    revalidatePath(`/agents/${id}`);
    revalidatePath('/agents');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update status' };
  }
}

export async function setAgentAvailabilityAction(agentId: string, _prev: unknown, formData: FormData) {
  await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const date = formData.get('date') as string;
  const isAvailable = formData.get('is_available') === 'true';

  if (!date) return { error: 'Date is required' };

  try {
    await agentService.setAvailability(agentId, date, isAvailable);
    revalidatePath(`/agents/${agentId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to set availability' };
  }
}
