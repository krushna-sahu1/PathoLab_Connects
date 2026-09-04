/** Public booking number (Hypatho Lab WhatsApp). Digits only, country code included. */
export const PUBLIC_WHATSAPP_E164 = '918926294034';

export function bookingWhatsAppUrl(message: string) {
  return `https://wa.me/${PUBLIC_WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
}

export const BOOKING_WHATSAPP_MESSAGE =
  "Hi Hypatho Lab — I'd like to book a home sample collection.";
