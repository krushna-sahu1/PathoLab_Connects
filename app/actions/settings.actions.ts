'use server';

import { revalidatePath } from 'next/cache';
import { settingsService } from '@/services/settings.service';
import { requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { firstZodMessage } from '@/lib/utils/zod';
import { z } from 'zod';

const settingsSchema = z.object({
  org_name: z.string().min(2).max(120),
  support_phone: z.string().optional().or(z.literal('')),
});

export async function updateSettingsAction(_prev: unknown, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin']);
  const parsed = settingsSchema.safeParse({
    org_name: formData.get('org_name'),
    support_phone: formData.get('support_phone') || '',
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await settingsService.update(
      {
        org_name: parsed.data.org_name,
        support_phone: parsed.data.support_phone || null,
      },
      user.id
    );
    await writeAuditLog({
      user_id: user.id,
      action: 'UPDATE',
      resource_type: 'settings',
      resource_id: 'app',
      new_values: parsed.data,
    });
    revalidatePath('/settings');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to save settings' };
  }
}
