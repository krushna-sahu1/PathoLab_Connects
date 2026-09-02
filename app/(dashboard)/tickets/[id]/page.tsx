import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { ticketService } from '@/services/ticket.service';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { TicketPriorityBadge } from '@/components/tickets/ticket-priority-badge';
import { TicketStatusForm } from '@/components/tickets/ticket-status-form';
import { TicketAssignForm } from '@/components/tickets/ticket-assign-form';
import { TicketMessageForm } from '@/components/tickets/ticket-message-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'tickets:write');
  const { id } = await params;

  let ticket;
  try {
    ticket = await ticketService.getTicketById(id);
  } catch {
    notFound();
  }

  const staff = canWrite ? await ticketService.getAssignableStaff() : [];
  const messages = [...(ticket.ticket_messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tickets" className="text-sm text-gray-500 hover:text-gray-700">← Tickets</Link>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">{ticket.ticket_id}</h2>
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Ticket Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Patient</dt>
                <dd className="font-medium">
                  {ticket.patients ? (
                    <Link href={`/patients/${ticket.patient_id}`} className="text-blue-600 hover:underline">
                      {ticket.patients.full_name}
                    </Link>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{ticket.patients?.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium capitalize">{ticket.category.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Assigned to</dt>
                <dd className="font-medium">{ticket.assignee?.full_name ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Opened</dt>
                <dd className="font-medium">{new Date(ticket.created_at).toLocaleString('en-IN')}</dd>
              </div>
            </dl>
          </div>

          {canWrite && ticket.status !== 'closed' && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
              <TicketStatusForm ticketId={id} currentStatus={ticket.status} />
            </div>
          )}

          {canWrite && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Assign</h3>
              <TicketAssignForm ticketId={id} staff={staff} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Messages</h3>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-md bg-gray-50 border border-gray-100 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="capitalize font-medium">{m.sender_type}</span>
                      <span>{new Date(m.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.message}</p>
                  </li>
                ))}
              </ul>
            )}
            {canWrite && ticket.status !== 'closed' && <TicketMessageForm ticketId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
