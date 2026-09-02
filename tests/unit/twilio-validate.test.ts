import { describe, expect, it } from 'vitest';
import { twilioWebhookUrl, verifyTwilioSignature } from '@/lib/twilio/validate';

describe('Twilio webhook verification', () => {
  it('rejects missing token or signature', () => {
    expect(verifyTwilioSignature('', 'sig', 'https://example.com/api/whatsapp', { Body: 'hi' })).toBe(false);
    expect(verifyTwilioSignature('token', null, 'https://example.com/api/whatsapp', { Body: 'hi' })).toBe(false);
  });

  it('builds webhook URL from NEXT_PUBLIC_APP_URL', () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL;
    const webhook = process.env.TWILIO_WEBHOOK_URL;
    delete process.env.TWILIO_WEBHOOK_URL;
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.hypatho.example';
    expect(twilioWebhookUrl()).toBe('https://app.hypatho.example/api/whatsapp');
    process.env.NEXT_PUBLIC_APP_URL = prev;
    if (webhook) process.env.TWILIO_WEBHOOK_URL = webhook;
  });
});
