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
  report_url: z.string().url('Enter a valid URL to the report PDF').optional().or(z.literal('')),
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  lab_remarks: z.string().optional().or(z.literal('')),
  is_delivered: z.coerce.boolean().default(false),
});

export type UpdateSampleStatusInput = z.infer<typeof updateSampleStatusSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
