import { MockWhatsAppProvider } from './mock-provider';
import { TwilioWhatsAppProvider } from './whatsapp';
import type { IWhatsAppProvider } from './types';

/**
 * Production uses Twilio. Mock is only for automated tests or an explicit
 * WHATSAPP_PROVIDER=mock override on a non-production machine.
 */
export function getWhatsAppProvider(): IWhatsAppProvider {
  const mode = (process.env.WHATSAPP_PROVIDER ?? '').toLowerCase();
  if (process.env.NODE_ENV === 'test' || mode === 'mock') {
    return new MockWhatsAppProvider();
  }
  return new TwilioWhatsAppProvider();
}
