import { createAdminClient } from '@/lib/supabase/admin';
import { getWhatsAppProvider } from '@/lib/twilio/provider';
import { WHATSAPP_TEMPLATES } from '@/lib/twilio/templates';
import { COLLECTION_TIME_SLOTS, TICKET_CATEGORIES } from '@/lib/constants';
import { normalizePhone } from '@/lib/utils/phone';
import { patientService } from '@/services/patient.service';
import { collectionService } from '@/services/collection.service';
import { sampleService } from '@/services/sample.service';
import { ticketService } from '@/services/ticket.service';
import type { WhatsAppConversation, WhatsAppMenuState, WhatsAppMessage } from '@/types/whatsapp';
import type { Patient, PatientAddress } from '@/types/patient';

const provider = getWhatsAppProvider();

const SAMPLE_STATUS_LABELS: Record<string, string> = {
  collected: 'Collected',
  in_transit: 'In transit to the lab',
  received_at_lab: 'Received at lab',
  accepted: 'Accepted by lab',
  processing: 'Processing',
  testing: 'Testing',
  report_ready: 'Report ready',
};

const COLLECTION_STATUS_LABELS: Record<string, string> = {
  new: 'Received — waiting for assignment',
  assigned: 'Assigned to an agent',
  accepted: 'Agent accepted',
  on_the_way: 'Agent on the way',
  arrived: 'Agent arrived',
  collected: 'Sample collected',
  failed: 'Unable to collect',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
};

function tomorrowISODate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function menuText(name?: string) {
  const greeting = name && name !== 'WhatsApp Patient' ? `Hi ${name}!\n` : 'Hi!\n';
  return `${greeting}${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
}

type ConversationRow = WhatsAppConversation;

export const whatsappService = {
  async sendMessage(to: string, body: string) {
    return provider.sendMessage({ to, body });
  },

  async handleIncomingMessage(from: string, body: string) {
    const phone = normalizePhone(from);
    const text = body.trim();
    const admin = createAdminClient();

    const patient = await patientService.findOrCreateByPhone(phone);
    const conversation = await ensureConversation(admin, phone, patient.id);

    await admin.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      message: text,
      status: 'delivered',
    });

    const reply = await routeMessage(conversation, patient, text);

    const sendResult = await provider.sendMessage({ to: phone, body: reply });
    await admin.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message: reply,
      status: sendResult.success ? 'sent' : 'failed',
      provider_message_id: sendResult.messageId ?? null,
    });
    await admin
      .from('whatsapp_conversations')
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return { reply, conversationId: conversation.id, patientId: patient.id };
  },

  async getConversations() {
    const supabase = await (await import('@/lib/supabase/server')).createServerSupabaseClient();
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('*, patients(id, full_name, phone)')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getConversationWithMessages(id: string) {
    const supabase = await (await import('@/lib/supabase/server')).createServerSupabaseClient();
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('*, patients(id, full_name, phone), whatsapp_messages(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    const messages = ((data.whatsapp_messages ?? []) as WhatsAppMessage[]).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return { ...data, whatsapp_messages: messages };
  },
};

async function ensureConversation(
  admin: ReturnType<typeof createAdminClient>,
  phone: string,
  patientId: string
): Promise<ConversationRow> {
  const { data: existing } = await admin
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) {
    if (!existing.patient_id) {
      await admin.from('whatsapp_conversations').update({ patient_id: patientId }).eq('id', existing.id);
      existing.patient_id = patientId;
    }
    return existing as ConversationRow;
  }

  const { data, error } = await admin
    .from('whatsapp_conversations')
    .insert({
      phone,
      patient_id: patientId,
      menu_state: 'main',
      context: {},
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ConversationRow;
}

async function setState(
  conversationId: string,
  menuState: WhatsAppMenuState,
  context: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  await admin
    .from('whatsapp_conversations')
    .update({
      menu_state: menuState,
      context,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
}

async function routeMessage(
  conversation: ConversationRow,
  patient: Patient & { patient_addresses?: PatientAddress[] },
  text: string
): Promise<string> {
  const lower = text.toLowerCase();
  const isMenuReset = lower === '0' || lower === 'menu' || lower === 'hi' || lower === 'hello';

  if (isMenuReset) {
    await setState(conversation.id, 'main', {});
    return menuText(patient.full_name);
  }

  const state = (conversation.menu_state || 'main') as WhatsAppMenuState;
  if (state === 'main') return handleMainMenu(conversation, patient, text);
  if (state === 'booking_address') return handleBookingAddress(conversation, patient, text);
  if (state === 'booking_date') return handleBookingDate(conversation, patient, text);
  if (state === 'booking_slot') return handleBookingSlot(conversation, patient, text);
  if (state === 'query_category') return handleQueryCategory(conversation, patient, text);
  if (state === 'query_description') return handleQueryDescription(conversation, patient, text);
  return menuText(patient.full_name);
}

async function handleMainMenu(
  conversation: ConversationRow,
  patient: Patient & { patient_addresses?: PatientAddress[] },
  text: string
): Promise<string> {
  switch (text.trim()) {
    case '1':
      return startBooking(conversation, patient);
    case '2':
      return trackCollection(patient.id);
    case '3':
      return trackSample(patient.id);
    case '4':
      return getReport(patient.id);
    case '5':
      await setState(conversation.id, 'query_category', {});
      return [
        'What is your query about? Reply with a number:',
        ...TICKET_CATEGORIES.map((c, i) => `${i + 1}. ${c.label}`),
      ].join('\n');
    case '6':
      return talkToSupport(patient);
    default:
      return `${WHATSAPP_TEMPLATES.WELCOME(patient.full_name)}\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
  }
}

async function startBooking(
  conversation: ConversationRow,
  patient: Patient & { patient_addresses?: PatientAddress[] }
) {
  const addresses = patient.patient_addresses?.length
    ? patient.patient_addresses
    : await patientService.getAddresses(patient.id);

  if (!addresses.length) {
    await setState(conversation.id, 'booking_address', { mode: 'new_address' });
    return 'No address on file. Reply with your address in this format:\nFull address, Area, Sector, Pincode\nExample: House 12 Green Park, Sector 1, Sector 1, 110001';
  }

  await setState(conversation.id, 'booking_address', { mode: 'pick' });
  const lines = addresses.map(
    (a, i) => `${i + 1}. ${a.label} — ${a.full_address}${a.pincode ? ` (${a.pincode})` : ''}`
  );
  return `Which address should we collect from?\n${lines.join('\n')}\n\nOr reply 0 for the main menu.`;
}

async function handleBookingAddress(
  conversation: ConversationRow,
  patient: Patient & { patient_addresses?: PatientAddress[] },
  text: string
) {
  const context = { ...(conversation.context ?? {}) };
  const addresses = patient.patient_addresses?.length
    ? patient.patient_addresses
    : await patientService.getAddresses(patient.id);

  if (context.mode === 'new_address') {
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) {
      return 'Please send: Full address, Area, Sector, Pincode';
    }
    const pincode = parts[parts.length - 1].replace(/\D/g, '');
    if (pincode.length < 6) {
      return 'The last part should be a 6-digit pincode. Try again.';
    }
    const address = await patientService.addAddress(patient.id, {
      label: 'home',
      full_address: parts[0],
      area: parts[1] || undefined,
      sector: parts[2] || parts[1] || undefined,
      pincode: pincode.slice(0, 6),
      is_primary: true,
    });
    context.address_id = address.id;
    await setState(conversation.id, 'booking_date', context);
    return datePrompt();
  }

  const index = parseInt(text, 10) - 1;
  const chosen = addresses[index];
  if (!chosen) {
    return 'Please reply with the number of an address from the list.';
  }
  context.address_id = chosen.id;
  await setState(conversation.id, 'booking_date', context);
  return datePrompt();
}

function datePrompt() {
  return `When should we collect?\n1. Today (${todayISODate()})\n2. Tomorrow (${tomorrowISODate()})`;
}

async function handleBookingDate(
  conversation: ConversationRow,
  _patient: Patient,
  text: string
) {
  const context = { ...(conversation.context ?? {}) };
  if (text === '1') context.date = todayISODate();
  else if (text === '2') context.date = tomorrowISODate();
  else return 'Reply 1 for today or 2 for tomorrow.';

  await setState(conversation.id, 'booking_slot', context);
  const slots = COLLECTION_TIME_SLOTS.map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `Pick a time slot:\n${slots}`;
}

async function handleBookingSlot(
  conversation: ConversationRow,
  patient: Patient,
  text: string
) {
  const context = { ...(conversation.context ?? {}) };
  const index = parseInt(text, 10) - 1;
  const slot = COLLECTION_TIME_SLOTS[index];
  if (!slot) return 'Please reply with a valid slot number.';

  const addressId = String(context.address_id ?? '');
  const date = String(context.date ?? '');
  if (!addressId || !date) {
    await setState(conversation.id, 'main', {});
    return `Something went wrong. ${menuText(patient.full_name)}`;
  }

  const collection = await collectionService.createCollection(
    {
      patient_id: patient.id,
      address_id: addressId,
      date,
      time_slot: slot,
      priority: 'normal',
    },
    undefined
  );

  await setState(conversation.id, 'main', {});
  return `${WHATSAPP_TEMPLATES.COLLECTION_CONFIRMED(date, slot, collection.collection_id)}\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
}

async function trackCollection(patientId: string) {
  const collections = await collectionService.getCollectionsByPatient(patientId);
  const latest = collections[0];
  if (!latest) {
    return `No collections found. Reply 1 to book a sample collection.\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
  }
  const status = COLLECTION_STATUS_LABELS[latest.status] ?? latest.status;
  return [
    `Latest collection: ${latest.collection_id}`,
    `Date: ${latest.date} (${latest.time_slot})`,
    `Status: ${status}`,
    latest.agents?.name ? `Agent: ${latest.agents.name}` : 'Agent: not assigned yet',
    '',
    WHATSAPP_TEMPLATES.MAIN_MENU(),
  ].join('\n');
}

async function trackSample(patientId: string) {
  const sample = await sampleService.getLatestSampleForPatient(patientId);
  if (!sample) {
    return `No samples found yet. We'll create one after collection is complete.\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
  }
  const status = SAMPLE_STATUS_LABELS[sample.status] ?? sample.status;
  return [
    `Latest sample: ${sample.sample_id}`,
    `Status: ${status}`,
    '',
    WHATSAPP_TEMPLATES.MAIN_MENU(),
  ].join('\n');
}

async function getReport(patientId: string) {
  const reports = await sampleService.getReportsByPatient(patientId);
  const latest = reports[0] as { status?: string; file_path?: string; report_date?: string; samples?: { sample_id?: string } } | undefined;
  if (!latest || latest.status === 'pending') {
    return `No report is ready yet. Reply 3 to track your sample.\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
  }
  const sampleId = latest.samples?.sample_id ?? 'your sample';
  const lines = [
    `Report for ${sampleId} is ${latest.status}.`,
    latest.report_date ? `Date: ${latest.report_date}` : '',
    latest.file_path ? `Download: ${latest.file_path}` : 'Our team will share the file shortly.',
    '',
    WHATSAPP_TEMPLATES.MAIN_MENU(),
  ];
  return lines.filter(Boolean).join('\n');
}

async function handleQueryCategory(
  conversation: ConversationRow,
  _patient: Patient,
  text: string
) {
  const index = parseInt(text, 10) - 1;
  const category = TICKET_CATEGORIES[index];
  if (!category) return 'Please reply with a category number from 1 to 5.';
  await setState(conversation.id, 'query_description', { category: category.value });
  return 'Please describe your query in a short message.';
}

async function handleQueryDescription(
  conversation: ConversationRow,
  patient: Patient,
  text: string
) {
  const category = String(conversation.context?.category ?? 'other') as
    | 'sample_collection'
    | 'report'
    | 'delivery'
    | 'billing'
    | 'other';
  const ticket = await ticketService.createTicket(
    {
      patient_id: patient.id,
      category,
      description: text,
      priority: 'normal',
    },
    undefined,
    false
  );
  await setState(conversation.id, 'main', {});
  return `${WHATSAPP_TEMPLATES.TICKET_CREATED(ticket.ticket_id)}\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
}

async function talkToSupport(patient: Patient) {
  const ticket = await ticketService.createTicket(
    {
      patient_id: patient.id,
      category: 'other',
      description: 'Patient requested to talk to support via WhatsApp.',
      priority: 'high',
    },
    undefined,
    false
  );
  return `${WHATSAPP_TEMPLATES.TICKET_CREATED(ticket.ticket_id)}\nA support agent will follow up with you.\n\n${WHATSAPP_TEMPLATES.MAIN_MENU()}`;
}
