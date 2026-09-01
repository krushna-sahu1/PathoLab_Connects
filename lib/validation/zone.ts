import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().min(2, 'Zone name must be at least 2 characters').max(100),
  description: z.string().optional().or(z.literal('')),
  daily_capacity: z.coerce.number().int().min(1, 'Daily capacity must be at least 1').default(20),
  is_active: z.coerce.boolean().default(true),
});

export const createZoneRuleSchema = z.object({
  rule_type: z.enum(['pincode', 'area', 'sector']),
  rule_value: z.string().min(1, 'Rule value is required').max(100),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type CreateZoneRuleInput = z.infer<typeof createZoneRuleSchema>;
