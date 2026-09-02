export const COLLECTION_TIME_SLOTS = [
  '06:00 - 08:00',
  '07:00 - 09:00',
  '08:00 - 10:00',
  '09:00 - 11:00',
  '10:00 - 12:00',
  '11:00 - 13:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
] as const;

export const TICKET_CATEGORIES = [
  { value: 'sample_collection', label: 'Sample Collection' },
  { value: 'report', label: 'Report' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
] as const;

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;
