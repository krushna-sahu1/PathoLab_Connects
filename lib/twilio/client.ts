// Twilio client initialisation
// Never instantiate on the client side
let twilioClient: unknown = null;

export function getTwilioClient() {
  if (!twilioClient) {
    // TODO Phase 9 — import twilio and initialise with env vars
    throw new Error('Twilio client not initialised yet — Phase 9');
  }
  return twilioClient;
}
