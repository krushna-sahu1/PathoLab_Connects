import { z } from 'zod';

export const sampleStatusValues = [
  'collected',
  'in_transit',
  'received_at_lab',
  'accepted',
  'processing',
  'testing',
  'report_ready',
] as const;

export const updateSampleStatusSchema = z.object({
  status: z.enum(sampleStatusValues),
  remark: z.string().optional().or(z.literal('')),
});

export const createReportSchema = z.object({
  sample_id: z.string().uuid(),
  file_path: z.string().max(500).optional().or(z.literal('')),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  lab_remarks: z.string().optional().or(z.literal('')),
});

export type UpdateSampleStatusInput = z.infer<typeof updateSampleStatusSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
