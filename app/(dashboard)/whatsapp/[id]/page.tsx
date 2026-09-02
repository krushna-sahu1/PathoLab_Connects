import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppMessage } from '@/types/whatsapp';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WhatsAppConversationPage({ params }: PageProps) {
  const user = await requireAuth();
  if (!hasPermission(user.role, 'whatsapp:read')) {
    return <p className="text-sm text-red-600">You do not have permission to view this conversation.</p>;
  }

  const { id } = await params;
  let conversation;
  try {
    conversation = await whatsappService.getConversationWithMessages(id);
  } catch {
    notFound();
  }

  const patient = conversation.patients as { id?: string; full_name?: string; phone?: string } | null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/whatsapp" className="text-sm text-gray-500 hover:text-gray-700">← WhatsApp</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">{patient?.full_name ?? conversation.phone}</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-2 text-sm">
        <p><span className="text-gray-500">Phone:</span> <span className="font-mono">{conversation.phone}</span></p>
        <p><span className="text-gray-500">Menu state:</span> {conversation.menu_state}</p>
        {patient?.id && (
          <p>
            <span className="text-gray-500">Patient:</span>{' '}
            <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">{patient.full_name}</Link>
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900">Thread</h3>
        {conversation.whatsapp_messages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages</p>
        ) : (
          conversation.whatsapp_messages.map((m: WhatsAppMessage) => (
            <div
              key={m.id}
              className={`rounded-md p-3 text-sm whitespace-pre-wrap ${
                m.direction === 'inbound'
                  ? 'bg-gray-50 border border-gray-100'
                  : 'bg-blue-50 border border-blue-100'
              }`}
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="capitalize">{m.direction}</span>
                <span>{new Date(m.created_at).toLocaleString('en-IN')}</span>
              </div>
              {m.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
