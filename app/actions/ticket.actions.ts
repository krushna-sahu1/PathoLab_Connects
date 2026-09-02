'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ticketService } from '@/services/ticket.service';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  ticketMessageSchema,
} from '@/lib/validation/ticket';
import { requireRole } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/auth/audit';
import { firstZodMessage } from '@/lib/utils/zod';
import type { TicketStatus } from '@/types/ticket';

const TICKET_ROLES = ['super_admin', 'operations_admin', 'support_agent'] as const;

export async function createTicketAction(_prev: unknown, formData: FormData) {
  const user = await requireRole([...TICKET_ROLES]);

  const parsed = createTicketSchema.safeParse({
    patient_id: formData.get('patient_id'),
    category: formData.get('category'),
    description: formData.get('description'),
    priority: formData.get('priority') || 'normal',
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    const ticket = await ticketService.createTicket(parsed.data, user.id, false);
    await writeAuditLog({
      user_id: user.id,
      action: 'CREATE',
      resource_type: 'ticket',
      resource_id: ticket.id,
      new_values: parsed.data,
    });
    revalidatePath('/tickets');
    redirect(`/tickets/${ticket.id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create ticket' };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  _prev: unknown,
  formData: FormData
) {
  const user = await requireRole([...TICKET_ROLES]);

  const parsed = updateTicketStatusSchema.safeParse({
    status: formData.get('status'),
    remark: formData.get('remark') || undefined,
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await ticketService.updateStatus(
      ticketId,
      parsed.data.status as TicketStatus,
      user.id,
      parsed.data.remark
    );
    await writeAuditLog({
      user_id: user.id,
      action: 'STATUS_CHANGE',
      resource_type: 'ticket',
      resource_id: ticketId,
      new_values: parsed.data,
    });
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update ticket' };
  }
}

export async function assignTicketAction(ticketId: string, _prev: unknown, formData: FormData) {
  const user = await requireRole([...TICKET_ROLES]);

  const parsed = assignTicketSchema.safeParse({
    assigned_to: formData.get('assigned_to'),
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await ticketService.assign(ticketId, parsed.data.assigned_to, user.id);
    await writeAuditLog({
      user_id: user.id,
      action: 'ASSIGN',
      resource_type: 'ticket',
      resource_id: ticketId,
      new_values: parsed.data,
    });
    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to assign ticket' };
  }
}

export async function addTicketMessageAction(
  ticketId: string,
  _prev: unknown,
  formData: FormData
) {
  const user = await requireRole([...TICKET_ROLES]);

  const parsed = ticketMessageSchema.safeParse({
    message: formData.get('message'),
  });
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  try {
    await ticketService.addMessage(ticketId, parsed.data.message, 'user', user.id);
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to add message' };
  }
}
