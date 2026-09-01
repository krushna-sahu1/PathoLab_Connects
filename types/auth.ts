import type { UUID, ISO8601 } from './common';

export type UserRole =
  | 'super_admin'
  | 'operations_admin'
  | 'logistics_manager'
  | 'collection_agent'
  | 'support_agent'
  | 'viewer';

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface Permission {
  id: UUID;
  name: string;
  description: string;
  resource: string;
  action: string;
}
