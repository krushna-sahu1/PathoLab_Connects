import type { UUID, ISO8601 } from './common';

export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppConversation {
  id: UUID;
  patient_id?: UUID;
  phone: string;
  last_message_at: ISO8601;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface WhatsAppMessage {
  id: UUID;
  conversation_id: UUID;
  direction: MessageDirection;
  message: string;
  status: MessageStatus;
  provider_message_id?: string;
  created_at: ISO8601;
}

export interface WhatsAppMenuOption {
  key: string;
  label: string;
  description?: string;
}
