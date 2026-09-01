import type { UUID, ISO8601 } from './common';

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'resolved'
  | 'closed';

export type TicketCategory =
  | 'sample_collection'
  | 'report'
  | 'delivery'
  | 'billing'
  | 'other';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Ticket {
  id: UUID;
  ticket_id: string;
  patient_id: UUID;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  assigned_to?: UUID;
  status: TicketStatus;
  created_at: ISO8601;
  resolved_at?: ISO8601;
  updated_at: ISO8601;
}

export interface TicketMessage {
  id: UUID;
  ticket_id: UUID;
  sender_id?: UUID;
  sender_type: 'user' | 'patient' | 'system';
  message: string;
  created_at: ISO8601;
}
