import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateTicketId } from '@/lib/utils/ids';
import type { Ticket, TicketMessage, TicketStatus } from '@/types/ticket';
import type { CreateTicketInput } from '@/lib/validation/ticket';
import { notificationService } from '@/services/notification.service';

export type TicketWithDetails = Ticket & {
  patients?: { id: string; full_name: string; phone: string } | null;
  assignee?: { id: string; full_name: string; email: string } | null;
  ticket_messages?: TicketMessage[];
};

export const ticketService = {
  async getTickets({
    status,
    category,
    patientId,
    page = 1,
    limit = 20,
  }: {
    status?: string;
    category?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('tickets')
      .select('*, patients(id, full_name, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (patientId) query = query.eq('patient_id', patientId);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { tickets: (data ?? []) as TicketWithDetails[], total: count ?? 0 };
  },

  async getTicketById(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('tickets')
      .select('*, patients(id, full_name, phone, email), ticket_messages(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);

    const ticket = data as TicketWithDetails;
    if (ticket.assigned_to) {
      const { data: assignee } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', ticket.assigned_to)
        .maybeSingle();
      ticket.assignee = assignee ?? null;
    }
    return ticket;
  },

  async getTicketsByPatient(patientId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []) as Ticket[];
  },

  async getAssignableStaff() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, is_active, user_roles(roles(name))')
      .eq('is_active', true)
      .order('full_name');
    if (error) throw new Error(error.message);

    const allowed = new Set(['super_admin', 'operations_admin', 'support_agent']);
    return (data ?? []).filter((user) => {
      const roles = user.user_roles as { roles?: { name?: string } }[] | null;
      const name = roles?.[0]?.roles?.name;
      return name ? allowed.has(name) : false;
    });
  },

  async createTicket(input: CreateTicketInput, createdBy?: string, notifyPatient = true) {
    const admin = createAdminClient();
    const ticket_id = generateTicketId();

    const { data, error } = await admin
      .from('tickets')
      .insert({
        ticket_id,
        patient_id: input.patient_id,
        category: input.category,
        description: input.description,
        priority: input.priority ?? 'normal',
        status: 'open',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await admin.from('ticket_messages').insert({
      ticket_id: data.id,
      sender_id: createdBy ?? null,
      sender_type: createdBy ? 'user' : 'patient',
      message: input.description,
    });

    if (notifyPatient) {
      const { data: patient } = await admin
        .from('patients')
        .select('phone')
        .eq('id', input.patient_id)
        .maybeSingle();
      if (patient?.phone) {
        void notificationService.notifyTicketCreated(patient.phone, ticket_id);
      }
    }

    return data as Ticket;
  },

  async updateStatus(ticketId: string, newStatus: TicketStatus, changedBy: string, remark?: string) {
    const admin = createAdminClient();
    const { data: current } = await admin
      .from('tickets')
      .select('status')
      .eq('id', ticketId)
      .single();
    if (!current) throw new Error('Ticket not found');

    const extra: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'resolved' || newStatus === 'closed') {
      extra.resolved_at = extra.updated_at;
    }

    const { data, error } = await admin
      .from('tickets')
      .update({ status: newStatus, ...extra })
      .eq('id', ticketId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const note = remark
      ? `Status changed from ${current.status} to ${newStatus}. ${remark}`
      : `Status changed from ${current.status} to ${newStatus}.`;

    await admin.from('ticket_messages').insert({
      ticket_id: ticketId,
      sender_id: changedBy,
      sender_type: 'system',
      message: note,
    });

    return data as Ticket;
  },

  async assign(ticketId: string, userId: string, changedBy: string) {
    const admin = createAdminClient();
    const { data: current } = await admin
      .from('tickets')
      .select('status')
      .eq('id', ticketId)
      .single();
    if (!current) throw new Error('Ticket not found');

    const nextStatus = current.status === 'open' ? 'assigned' : current.status;
    const { data, error } = await admin
      .from('tickets')
      .update({
        assigned_to: userId,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await admin.from('ticket_messages').insert({
      ticket_id: ticketId,
      sender_id: changedBy,
      sender_type: 'system',
      message: `Ticket assigned to staff member.`,
    });

    return data as Ticket;
  },

  async addMessage(
    ticketId: string,
    message: string,
    senderType: TicketMessage['sender_type'],
    senderId?: string
  ) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId ?? null,
        sender_type: senderType,
        message,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await admin
      .from('tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data as TicketMessage;
  },
};
