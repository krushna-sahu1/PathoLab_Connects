'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { zoneService } from '@/services/zone.service';
import { createZoneSchema, createZoneRuleSchema } from '@/lib/validation/zone';
import { requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';

export async function createZoneAction(formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    daily_capacity: formData.get('daily_capacity') as string,
    is_active: true,
  };

  const parsed = createZoneSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const zone = await zoneService.createZone(parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'zone',
      resource_id: zone.id,
      new_values: parsed.data,
    });
    revalidatePath('/zones');
    redirect(`/zones/${zone.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create zone' };
  }
}

export async function updateZoneAction(id: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    daily_capacity: formData.get('daily_capacity') as string,
    is_active: formData.get('is_active') === 'true',
  };

  const parsed = createZoneSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await zoneService.updateZone(id, parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'UPDATE',
      resource_type: 'zone',
      resource_id: id,
      new_values: parsed.data,
    });
    revalidatePath(`/zones/${id}`);
    revalidatePath('/zones');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update zone' };
  }
}

export async function addZoneRuleAction(zoneId: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);

  const raw = {
    rule_type: formData.get('rule_type') as string,
    rule_value: formData.get('rule_value') as string,
  };

  const parsed = createZoneRuleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await zoneService.addZoneRule(zoneId, parsed.data);
    await writeAuditLog({
      user_id: user.id,
      action: 'ADD_RULE',
      resource_type: 'zone',
      resource_id: zoneId,
      new_values: parsed.data,
    });
    revalidatePath(`/zones/${zoneId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to add rule' };
  }
}

export async function deleteZoneRuleAction(ruleId: string, zoneId: string) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);
  try {
    await zoneService.deleteZoneRule(ruleId);
    await writeAuditLog({
      user_id: user.id,
      action: 'DELETE_RULE',
      resource_type: 'zone',
      resource_id: zoneId,
      new_values: { rule_id: ruleId },
    });
    revalidatePath(`/zones/${zoneId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to delete rule' };
  }
}

export async function assignZoneAgentsAction(zoneId: string, _prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'logistics_manager']);
  const primary = (formData.get('primary_agent_id') as string) || null;
  const backup = (formData.get('backup_agent_id') as string) || null;

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { error } = await admin
      .from('zones')
      .update({
        primary_agent_id: primary,
        backup_agent_id: backup,
        updated_at: new Date().toISOString(),
      })
      .eq('id', zoneId);
    if (error) throw new Error(error.message);

    await writeAuditLog({
      user_id: user.id,
      action: 'ASSIGN_AGENTS',
      resource_type: 'zone',
      resource_id: zoneId,
      new_values: { primary_agent_id: primary, backup_agent_id: backup },
    });
    revalidatePath(`/zones/${zoneId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to assign agents' };
  }
}
