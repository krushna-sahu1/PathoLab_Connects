import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { ticketService } from '@/services/ticket.service';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { TicketPriorityBadge } from '@/components/tickets/ticket-priority-badge';
import { TICKET_CATEGORIES } from '@/lib/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'tickets:write');
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const { tickets, total } = await ticketService.getTickets({
    status: params.status,
    category: params.category,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="mt-1 text-sm text-gray-500">{total} total</p>
        </div>
        {canWrite && (
          <Link
            href="/tickets/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Ticket
          </Link>
        )}
      </div>

      <form method="GET" className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={params.category ?? ''}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {TICKET_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Filter
        </button>
        <a href="/tickets" className="rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</a>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No tickets found</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{ticket.ticket_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{ticket.patients?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{ticket.patients?.phone}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">{ticket.category.replace('_', ' ')}</td>
                  <td className="px-4 py-3"><TicketPriorityBadge priority={ticket.priority} /></td>
                  <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
