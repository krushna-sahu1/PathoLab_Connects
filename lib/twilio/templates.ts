// WhatsApp message templates

export const WHATSAPP_TEMPLATES = {
  WELCOME: (name: string) =>
    `Welcome to Hypatho, ${name}! How can we help you today?`,
  COLLECTION_CONFIRMED: (date: string, timeSlot: string, collectionId: string) =>
    `Your sample collection ${collectionId} is confirmed for ${date} at ${timeSlot}.`,
  COLLECTION_ASSIGNED: (agentName: string, date: string, timeSlot: string) =>
    `An agent has been assigned for your collection on ${date} (${timeSlot}). Agent: ${agentName}.`,
  COLLECTION_ON_THE_WAY: (agentName: string) =>
    `Your collection agent ${agentName} is on the way!`,
  COLLECTION_COLLECTED: (collectionId: string) =>
    `Sample collected for ${collectionId}. We'll update you as it moves through the lab.`,
  COLLECTION_FAILED: (reason: string) =>
    `We were unable to complete your sample collection. Reason: ${reason}. Reply 1 to book again, or 6 to talk to support.`,
  REPORT_READY: (patientName: string, sampleId: string) =>
    `Hi ${patientName}, your report for sample ${sampleId} is ready. Reply 4 to view details.`,
  TICKET_CREATED: (ticketId: string) =>
    `We've opened support ticket ${ticketId}. Our team will follow up shortly.`,
  MAIN_MENU: () =>
    `Reply with:\n1. Book Sample Collection\n2. Track My Collection\n3. Track My Sample\n4. Get My Report\n5. Raise a Query\n6. Talk to Support\n0. Main menu`,
} as const;
