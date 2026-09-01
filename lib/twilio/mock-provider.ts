import type { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from './types';

// Mock WhatsApp provider for development
export class MockWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    console.log('[MockWhatsAppProvider] sendMessage:', payload);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }
}
