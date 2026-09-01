// WhatsApp message templates
// TODO Phase 9 — implement Twilio-approved templates

export const WHATSAPP_TEMPLATES = {
  WELCOME: (name: string) => `Welcome to Hypatho, ${name}! How can we help you today?`,
  COLLECTION_CONFIRMED: (date: string, timeSlot: string) =>
    `Your sample collection is confirmed for ${date} at ${timeSlot}.`,
  COLLECTION_ON_THE_WAY: (agentName: string) =>
    `Your collection agent ${agentName} is on the way!`,
  REPORT_READY: (patientName: string) =>
    `Hi ${patientName}, your report is ready. Reply with '4' to download.`,
  MAIN_MENU: () =>
    `Welcome! Reply with:\n1. Book Sample Collection\n2. Track My Collection\n3. Track My Sample\n4. Get My Report\n5. Raise a Query\n6. Talk to Support`,
} as const;
