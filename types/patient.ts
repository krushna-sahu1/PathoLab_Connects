import type { UUID, ISO8601 } from './common';

export type PatientStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';
export type AddressLabel = 'home' | 'office' | 'other';

export interface Patient {
  id: UUID;
  patient_id: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: ISO8601;
  gender?: Gender;
  status: PatientStatus;
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface PatientAddress {
  id: UUID;
  patient_id: UUID;
  label: AddressLabel;
  full_address: string;
  area?: string;
  sector?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  zone_id?: UUID;
  is_primary: boolean;
  created_at: ISO8601;
  updated_at: ISO8601;
}
