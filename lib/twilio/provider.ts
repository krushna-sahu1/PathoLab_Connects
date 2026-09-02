import { MockWhatsAppProvider } from './mock-provider';
import { TwilioWhatsAppProvider } from './whatsapp';
import type { IWhatsAppProvider } from './types';

export function getWhatsAppProvider(): IWhatsAppProvider {
  const mode = (process.env.WHATSAPP_PROVIDER ?? 'mock').toLowerCase();
  if (mode === 'twilio') {
    return new TwilioWhatsAppProvider();
  }
  return new MockWhatsAppProvider();
}
