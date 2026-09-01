import type { UUID, ISO8601 } from './common';

export interface Zone {
  id: UUID;
  name: string;
  description?: string;
  areas: string[];
  sectors: string[];
  pincodes: string[];
  primary_agent_id?: UUID;
  backup_agent_id?: UUID;
  daily_capacity: number;
  is_active: boolean;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface ZoneRule {
  id: UUID;
  zone_id: UUID;
  rule_type: 'pincode' | 'area' | 'sector';
  rule_value: string;
  created_at: ISO8601;
}
