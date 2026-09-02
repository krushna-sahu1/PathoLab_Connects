'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sampleService } from '@/services/sample.service';
import { updateSampleStatusSchema, createReportSchema } from '@/lib/validation/sample';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import type { SampleStatus } from '@/services/sample.service';

export async function updateSampleStatusAction(sampleId: string, formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'lab_technician']);

  const parsed = updateSampleStatusSchema.safeParse({
    status: formData.get('status'),
    remark: formData.get('remark') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await sampleService.updateStatus(
      sampleId,
      parsed.data.status as SampleStatus,
      user.id,
      parsed.data.remark
    );
    await writeAuditLog({
      user_id: user.id,
      action: 'STATUS_CHANGE',
      resource_type: 'sample',
      resource_id: sampleId,
      new_values: parsed.data,
    });
    revalidatePath(`/samples/${sampleId}`);
    revalidatePath('/samples');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update status' };
  }
}

export async function createReportAction(formData: FormData) {
  const user = await requireRole(['super_admin', 'operations_admin', 'lab_technician']);

  const parsed = createReportSchema.safeParse({
    sample_id: formData.get('sample_id'),
    report_url: formData.get('report_url') || undefined,
    report_date: formData.get('report_date'),
    lab_remarks: formData.get('lab_remarks') || undefined,
    is_delivered: formData.get('is_delivered') === 'true',
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const report = await sampleService.createReport(parsed.data, user.id);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'report',
      resource_id: report.id,
      new_values: parsed.data,
    });
    revalidatePath(`/samples/${parsed.data.sample_id}`);
    revalidatePath('/reports');
    redirect(`/reports/${report.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create report' };
  }
}

export async function markReportDeliveredAction(reportId: string, sampleId: string) {
  const user = await requireRole(['super_admin', 'operations_admin', 'lab_technician']);
  try {
    await sampleService.markReportDelivered(reportId);
    await writeAuditLog({
      user_id: user.id,
      action: 'MARK_DELIVERED',
      resource_type: 'report',
      resource_id: reportId,
      new_values: { is_delivered: true },
    });
    revalidatePath(`/reports/${reportId}`);
    revalidatePath(`/samples/${sampleId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to mark as delivered' };
  }
}
