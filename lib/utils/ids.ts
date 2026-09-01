/**
 * Generate a unique Patient ID in format PAT-YYYYMMDD-XXXX
 */
export function generatePatientId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAT-${date}-${random}`;
}

/**
 * Generate a Collection ID in format COL-YYYYMMDD-XXXX
 */
export function generateCollectionId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `COL-${date}-${random}`;
}

/**
 * Generate a Sample ID in format SMP-YYYYMMDD-XXXX
 */
export function generateSampleId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SMP-${date}-${random}`;
}

/**
 * Generate a Ticket ID in format TKT-YYYYMMDD-XXXX
 */
export function generateTicketId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${date}-${random}`;
}
