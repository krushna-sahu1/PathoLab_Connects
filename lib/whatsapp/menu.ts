import type { WhatsAppMenuState } from '@/types/whatsapp';

export type MainMenuAction =
  | 'book'
  | 'track_collection'
  | 'track_sample'
  | 'get_report'
  | 'raise_query'
  | 'talk_to_support';

export function isResetCommand(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return lower === '0' || lower === 'menu' || lower === 'hi' || lower === 'hello';
}

export function parseMainMenu(text: string): MainMenuAction | null {
  switch (text.trim()) {
    case '1':
      return 'book';
    case '2':
      return 'track_collection';
    case '3':
      return 'track_sample';
    case '4':
      return 'get_report';
    case '5':
      return 'raise_query';
    case '6':
      return 'talk_to_support';
    default:
      return null;
  }
}

/** Returns a 0-based index, or null if the reply is not a valid list choice. */
export function parseOneBasedIndex(text: string, length: number): number | null {
  if (length <= 0) return null;
  const n = Number.parseInt(text.trim(), 10);
  if (!Number.isInteger(n) || n < 1 || n > length) return null;
  return n - 1;
}

export function resolveBookingDate(
  choice: string,
  today: string,
  tomorrow: string
): string | null {
  if (choice.trim() === '1') return today;
  if (choice.trim() === '2') return tomorrow;
  return null;
}

export function nextStateAfterReset(): WhatsAppMenuState {
  return 'main';
}
