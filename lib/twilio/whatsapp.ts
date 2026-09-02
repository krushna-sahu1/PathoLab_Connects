import { getTwilioClient } from './client';
import type { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from './types';
import { toWhatsAppAddress } from '@/lib/utils/phone';

export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    try {
      const from = process.env.TWILIO_WHATSAPP_NUMBER;
      if (!from) {
        return { success: false, error: 'TWILIO_WHATSAPP_NUMBER is not set' };
      }

      const client = getTwilioClient();
      const message = await client.messages.create({
        from,
        to: payload.to.startsWith('whatsapp:') ? payload.to : toWhatsAppAddress(payload.to),
        body: payload.body,
        mediaUrl: payload.mediaUrl,
      });

      return { success: true, messageId: message.sid };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Twilio send failed',
      };
    }
  }
}
