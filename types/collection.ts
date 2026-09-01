import type { UUID, ISO8601 } from './common';

export type CollectionStatus =
  | 'new'
  | 'assigned'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'collected'
  | 'failed'
  | 'cancelled'
  | 'rescheduled';

export type CollectionPriority = 'normal' | 'urgent';

export interface Collection {
  id: UUID;
  collection_id: string;
  patient_id: UUID;
  address_id: UUID;
  zone_id?: UUID;
  agent_id?: UUID;
  date: string;
  time_slot: string;
  priority: CollectionPriority;
  notes?: string;
  status: CollectionStatus;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface CollectionStatusHistory {
  id: UUID;
  collection_id: UUID;
  previous_status?: CollectionStatus;
  new_status: CollectionStatus;
  changed_by?: UUID;
  remark?: string;
  created_at: ISO8601;
}

export type FailureReason =
  | 'patient_unavailable'
  | 'wrong_address'
  | 'patient_cancelled'
  | 'no_response'
  | 'address_inaccessible'
  | 'other';
