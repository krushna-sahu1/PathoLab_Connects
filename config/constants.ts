export const APP_NAME = 'Hypatho Connects';
export const APP_VERSION = '0.1.0';

export const COLLECTION_STATUSES = [
  'new', 'assigned', 'accepted', 'on_the_way',
  'arrived', 'collected', 'failed', 'cancelled', 'rescheduled',
] as const;

export const SAMPLE_STATUSES = [
  'collected', 'in_transit', 'received_at_lab',
  'accepted', 'processing', 'testing', 'report_ready',
] as const;

export const TICKET_STATUSES = [
  'open', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed',
] as const;

export const WHATSAPP_MENU = {
  BOOK_COLLECTION: '1',
  TRACK_COLLECTION: '2',
  TRACK_SAMPLE: '3',
  GET_REPORT: '4',
  RAISE_QUERY: '5',
  TALK_TO_SUPPORT: '6',
} as const;
