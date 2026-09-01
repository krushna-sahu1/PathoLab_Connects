export interface WhatsAppMessagePayload {
  to: string;
  body: string;
  mediaUrl?: string[];
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult>;
}
