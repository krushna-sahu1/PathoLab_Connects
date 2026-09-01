import { MockWhatsAppProvider } from '@/lib/twilio/mock-provider';
import type { IWhatsAppProvider } from '@/lib/twilio/types';

// TODO Phase 9 — switch to TwilioWhatsAppProvider in production
const provider: IWhatsAppProvider = new MockWhatsAppProvider();

export const whatsappService = {
  async sendMessage(to: string, body: string) {
    return provider.sendMessage({ to, body });
  },

  async handleIncomingMessage(_from: string, _body: string) {
    // TODO Phase 9 — WhatsApp menu handler
    // 1. Identify or create patient by phone
    // 2. Parse message / menu selection
    // 3. Handle flow: booking, tracking, report, ticket, support
    throw new Error('Not implemented — Phase 9');
  },
};
