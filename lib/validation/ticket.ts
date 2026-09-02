import { z } from 'zod';

export const ticketCategoryValues = [
  'sample_collection',
  'report',
  'delivery',
  'billing',
  'other',
] as const;

export const ticketStatusValues = [
  'open',
  'assigned',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
] as const;

export const ticketPriorityValues = ['low', 'normal', 'high', 'urgent'] as const;

export const createTicketSchema = z.object({
  patient_id: z.string().uuid('Invalid patient'),
  category: z.enum(ticketCategoryValues),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  priority: z.enum(ticketPriorityValues).default('normal'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatusValues),
  remark: z.string().optional().or(z.literal('')),
});

export const assignTicketSchema = z.object({
  assigned_to: z.string().uuid('Invalid user'),
});

export const ticketMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
