import Twilio from 'twilio';

let twilioClient: ReturnType<typeof Twilio> | null = null;

export function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid.startsWith('your-')) {
    throw new Error('Twilio credentials are not configured');
  }

  twilioClient = Twilio(sid, token);
  return twilioClient;
}
