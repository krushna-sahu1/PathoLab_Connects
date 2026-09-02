import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { whatsappService } from '@/services/whatsapp.service';
import { WhatsAppSimulator } from '@/components/whatsapp/simulator-form';

export default async function WhatsAppPage() {
  const user = await requireAuth();
  if (!hasPermission(user.role, 'whatsapp:read')) {
    return <p className="text-sm text-red-600">You do not have permission to view WhatsApp conversations.</p>;
  }

  const conversations = await whatsappService.getConversations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp</h2>
        <p className="mt-1 text-sm text-gray-500">
          Patient chatbot (mock provider). Outbound notifications are sent from the app, not n8n.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WhatsAppSimulator />
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last message</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No conversations yet — send a mock message to start one.
                  </td>
                </tr>
              ) : (
                conversations.map((c: {
                  id: string;
                  phone: string;
                  menu_state?: string;
                  last_message_at?: string;
                  patients?: { full_name?: string };
                }) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.patients?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.menu_state ?? 'main'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.last_message_at ? new Date(c.last_message_at).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/whatsapp/${c.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
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
    </div>
  );
}
