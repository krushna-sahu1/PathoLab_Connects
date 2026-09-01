import type { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from './types';

// TODO Phase 9 — TwilioWhatsAppProvider
export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(_payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    throw new Error('TwilioWhatsAppProvider not implemented yet — Phase 9');
  }
}
