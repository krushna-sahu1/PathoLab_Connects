import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { getAgentForUser } from '@/lib/auth/agent-auth';
import { collectionService } from '@/services/collection.service';
import { AgentStatusUpdateForm } from '@/components/agent/agent-status-update-form';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentJobDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const agent = await getAgentForUser(user.id);
  const { id } = await params;

  if (!agent) {
    return <div className="text-center py-12 text-gray-400">No agent profile found.</div>;
  }

  let collection;
  try {
    collection = await collectionService.getCollectionById(id);
  } catch {
    notFound();
  }

  // Only the assigned agent can see their job detail
  if (collection.agent_id !== agent.id) {
    redirect('/agent');
  }

  const history = collection.collection_status_history ?? [];
  const isActive = !['collected', 'failed', 'cancelled'].includes(collection.status);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/agent" className="text-gray-400 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">{collection.collection_id}</h2>
          <CollectionStatusBadge status={collection.status} />
        </div>
      </div>

      {/* Patient & address */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {collection.patients?.full_name?.charAt(0) ?? 'P'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{collection.patients?.full_name}</p>
            <a href={`tel:${collection.patients?.phone}`} className="text-sm text-blue-600">
              {collection.patients?.phone}
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-3 space-y-1">
          <p className="text-xs text-gray-400 font-medium">ADDRESS</p>
          <p className="text-sm text-gray-800">{collection.patient_addresses?.full_address}</p>
          {collection.patient_addresses?.area && (
            <p className="text-xs text-gray-500">{collection.patient_addresses.area} · {collection.patient_addresses.pincode}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400 font-medium">DATE</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{collection.date}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-400 font-medium">TIME SLOT</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{collection.time_slot}</p>
          </div>
        </div>

        {collection.notes && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-600 font-medium">NOTES FROM OPS</p>
            <p className="text-sm text-amber-800 mt-0.5">{collection.notes}</p>
          </div>
        )}

        {/* Call/Map buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${collection.patients?.phone}`}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            📞 Call Patient
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(collection.patient_addresses?.full_address ?? '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            🗺️ Navigate
          </a>
        </div>
      </div>

      {/* Status update */}
      {isActive && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
          <AgentStatusUpdateForm collectionId={id} currentStatus={collection.status} />
        </div>
      )}

      {!isActive && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="font-semibold text-green-800">Job Complete</p>
          <p className="text-sm text-green-600">Status: {collection.status}</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">History</h3>
          <ol className="space-y-3">
            {[...history]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-800">{h.new_status.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString('en-IN')}</p>
                    {h.remark && <p className="text-xs text-gray-500 italic">{h.remark}</p>}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
