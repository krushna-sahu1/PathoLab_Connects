import type { UUID, ISO8601 } from './common';

export type AgentStatus = 'available' | 'busy' | 'offline' | 'on_leave' | 'inactive';
export type AgentRole = 'collection_agent';

export interface Agent {
  id: UUID;
  user_id?: UUID;
  name: string;
  phone: string;
  email?: string;
  status: AgentStatus;
  role: AgentRole;
  primary_zone_id?: UUID;
  backup_zone_ids: UUID[];
  daily_capacity: number;
  working_days: string[];
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface AgentAvailability {
  id: UUID;
  agent_id: UUID;
  date: string;
  is_available: boolean;
  current_load: number;
  created_at: ISO8601;
  updated_at: ISO8601;
}
