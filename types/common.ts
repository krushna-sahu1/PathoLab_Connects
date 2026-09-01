export type UUID = string;
export type ISO8601 = string;

export interface TimestampFields {
  created_at: ISO8601;
  updated_at: ISO8601;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
