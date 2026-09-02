import { createAdminClient } from '@/lib/supabase/admin';
import { getWhatsAppProvider } from '@/lib/twilio/provider';
import { WHATSAPP_TEMPLATES } from '@/lib/twilio/templates';
import { normalizePhone } from '@/lib/utils/phone';

const provider = getWhatsAppProvider();

async function persistOutbound(phone: string, body: string, providerMessageId?: string) {
  const admin = createAdminClient();
  const normalized = normalizePhone(phone);

  const { data: conversation } = await admin
    .from('whatsapp_conversations')
    .select('id')
    .eq('phone', normalized)
    .maybeSingle();

  if (!conversation) return;

  await admin.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message: body,
    status: 'sent',
    provider_message_id: providerMessageId ?? null,
  });

  await admin
    .from('whatsapp_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation.id);
}

export const notificationService = {
  async sendPatientWhatsApp(phone: string, body: string) {
    try {
      const result = await provider.sendMessage({ to: phone, body });
      if (result.success) {
        await persistOutbound(phone, body, result.messageId);
      } else {
        console.error('[notifications] WhatsApp send failed:', result.error);
      }
      return result;
    } catch (err) {
      console.error('[notifications] WhatsApp send error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Send failed' };
    }
  },

  async notifyCollectionAssigned(params: {
    phone: string;
    agentName: string;
    date: string;
    timeSlot: string;
  }) {
    return notificationService.sendPatientWhatsApp(
      params.phone,
      WHATSAPP_TEMPLATES.COLLECTION_ASSIGNED(params.agentName, params.date, params.timeSlot)
    );
  },

  async notifyCollectionOnTheWay(phone: string, agentName: string) {
    return notificationService.sendPatientWhatsApp(
      phone,
      WHATSAPP_TEMPLATES.COLLECTION_ON_THE_WAY(agentName)
    );
  },

  async notifyCollectionCollected(phone: string, collectionId: string) {
    return notificationService.sendPatientWhatsApp(
      phone,
      WHATSAPP_TEMPLATES.COLLECTION_COLLECTED(collectionId)
    );
  },

  async notifyCollectionFailed(phone: string, reason: string) {
    return notificationService.sendPatientWhatsApp(
      phone,
      WHATSAPP_TEMPLATES.COLLECTION_FAILED(reason)
    );
  },

  async notifyCollectionConfirmed(params: {
    phone: string;
    date: string;
    timeSlot: string;
    collectionId: string;
  }) {
    return notificationService.sendPatientWhatsApp(
      params.phone,
      WHATSAPP_TEMPLATES.COLLECTION_CONFIRMED(params.date, params.timeSlot, params.collectionId)
    );
  },

  async notifyReportReady(phone: string, patientName: string, sampleId: string) {
    return notificationService.sendPatientWhatsApp(
      phone,
      WHATSAPP_TEMPLATES.REPORT_READY(patientName, sampleId)
    );
  },

  async notifyTicketCreated(phone: string, ticketId: string) {
    return notificationService.sendPatientWhatsApp(
      phone,
      WHATSAPP_TEMPLATES.TICKET_CREATED(ticketId)
    );
  },
};
