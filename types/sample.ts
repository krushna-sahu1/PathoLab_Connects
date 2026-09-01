import type { UUID, ISO8601 } from './common';

export type SampleStatus =
  | 'collected'
  | 'in_transit'
  | 'received_at_lab'
  | 'accepted'
  | 'processing'
  | 'testing'
  | 'report_ready';

export interface Sample {
  id: UUID;
  sample_id: string;
  collection_id: UUID;
  patient_id: UUID;
  status: SampleStatus;
  collected_at?: ISO8601;
  received_at_lab?: ISO8601;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface SampleStatusHistory {
  id: UUID;
  sample_id: UUID;
  previous_status?: SampleStatus;
  new_status: SampleStatus;
  changed_by?: UUID;
  remark?: string;
  created_at: ISO8601;
}
