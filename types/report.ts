import type { UUID, ISO8601 } from './common';

export type ReportStatus = 'pending' | 'ready' | 'delivered';

export interface Report {
  id: UUID;
  patient_id: UUID;
  sample_id: UUID;
  status: ReportStatus;
  file_path?: string;
  report_date?: string;
  report_ready_at?: ISO8601;
  created_at: ISO8601;
  updated_at: ISO8601;
}
