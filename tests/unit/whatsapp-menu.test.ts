import { describe, expect, it } from 'vitest';
import {
  isResetCommand,
  parseMainMenu,
  parseOneBasedIndex,
  resolveBookingDate,
} from '@/lib/whatsapp/menu';

describe('WhatsApp menu state machine', () => {
  it('treats hi/menu/0 as reset', () => {
    expect(isResetCommand('hi')).toBe(true);
    expect(isResetCommand('HELLO')).toBe(true);
    expect(isResetCommand('0')).toBe(true);
    expect(isResetCommand('menu')).toBe(true);
    expect(isResetCommand('1')).toBe(false);
  });

  it('maps main menu digits to actions', () => {
    expect(parseMainMenu('1')).toBe('book');
    expect(parseMainMenu('2')).toBe('track_collection');
    expect(parseMainMenu('3')).toBe('track_sample');
    expect(parseMainMenu('4')).toBe('get_report');
    expect(parseMainMenu('5')).toBe('raise_query');
    expect(parseMainMenu('6')).toBe('talk_to_support');
    expect(parseMainMenu('9')).toBeNull();
    expect(parseMainMenu('book')).toBeNull();
  });

  it('parses 1-based list choices', () => {
    expect(parseOneBasedIndex('1', 3)).toBe(0);
    expect(parseOneBasedIndex('3', 3)).toBe(2);
    expect(parseOneBasedIndex('0', 3)).toBeNull();
    expect(parseOneBasedIndex('4', 3)).toBeNull();
    expect(parseOneBasedIndex('x', 3)).toBeNull();
  });

  it('resolves today/tomorrow booking dates', () => {
    expect(resolveBookingDate('1', '2026-09-02', '2026-09-03')).toBe('2026-09-02');
    expect(resolveBookingDate('2', '2026-09-02', '2026-09-03')).toBe('2026-09-03');
    expect(resolveBookingDate('3', '2026-09-02', '2026-09-03')).toBeNull();
  });
});
