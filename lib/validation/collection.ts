import { z } from 'zod';

export const createCollectionSchema = z.object({
  patient_id: z.string().uuid('Invalid patient'),
  address_id: z.string().uuid('Invalid address'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time_slot: z.string().min(1, 'Time slot is required'),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  notes: z.string().optional().or(z.literal('')),
});

export const updateCollectionStatusSchema = z.object({
  status: z.enum(['new','assigned','accepted','on_the_way','arrived','collected','failed','cancelled','rescheduled']),
  remark: z.string().optional().or(z.literal('')),
  failure_reason: z.string().optional().or(z.literal('')),
});

export const reassignCollectionSchema = z.object({
  agent_id: z.string().uuid('Invalid agent'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionStatusInput = z.infer<typeof updateCollectionStatusSchema>;
