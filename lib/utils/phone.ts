/** Strip WhatsApp / country-code prefixes down to a 10-digit local number when possible. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

/** Format a stored phone for Twilio WhatsApp (`whatsapp:+91XXXXXXXXXX`). */
export function toWhatsAppAddress(phone: string): string {
  if (phone.startsWith('whatsapp:')) return phone;
  const digits = normalizePhone(phone);
  if (digits.length === 10) return `whatsapp:+91${digits}`;
  return `whatsapp:+${digits}`;
}
