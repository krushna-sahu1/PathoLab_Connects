import { z } from 'zod';

export const createCollectionSchema = z.object({
  patient_id: z.string().uuid(),
  address_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot: z.string(),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  notes: z.string().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
