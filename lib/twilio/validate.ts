import Twilio from 'twilio';

export function verifyTwilioSignature(
  authToken: string,
  signature: string | null,
  webhookUrl: string,
  params: Record<string, string>
): boolean {
  if (!authToken || !signature || !webhookUrl) return false;
  return Twilio.validateRequest(authToken, signature, webhookUrl, params);
}

export function twilioWebhookUrl(): string {
  if (process.env.TWILIO_WEBHOOK_URL) return process.env.TWILIO_WEBHOOK_URL;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/api/whatsapp` : '';
}
