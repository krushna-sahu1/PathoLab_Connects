import { z } from 'zod';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const agentStatusSchema = z.enum(['available', 'busy', 'offline', 'on_leave', 'inactive']);

export const createAgentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  status: agentStatusSchema.default('available'),
  primary_zone_id: z.string().uuid().optional().or(z.literal('')),
  backup_zone_ids: z.array(z.string().uuid()).default([]),
  daily_capacity: z.coerce.number().int().min(1).max(50).default(10),
  working_days: z.array(z.enum(DAYS_OF_WEEK)).default(['monday','tuesday','wednesday','thursday','friday','saturday']),
});

export const updateAgentStatusSchema = z.object({
  status: agentStatusSchema,
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
