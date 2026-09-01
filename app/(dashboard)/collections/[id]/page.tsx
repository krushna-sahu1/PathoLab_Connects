import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { collectionService } from '@/services/collection.service';
import { agentService } from '@/services/agent.service';
import { CollectionStatusBadge } from '@/components/collections/collection-status-badge';
import { PriorityBadge } from '@/components/collections/priority-badge';
import { StatusTimeline } from '@/components/collections/status-timeline';
import { StatusUpdateForm } from '@/components/collections/status-update-form';
import { ManualAssignForm } from '@/components/collections/manual-assign-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'collections:write');
  const { id } = await params;

  let collection;
  try {
    collection = await collectionService.getCollectionById(id);
  } catch {
    notFound();
  }

  const agents = canWrite ? await agentService.getAgents() : [];
  const history = collection.collection_status_history ?? [];

  const isActive = !['collected', 'failed', 'cancelled'].includes(collection.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/collections" className="text-sm text-gray-500 hover:text-gray-700">← Collections</Link>
          <span className="text-gray-300">/</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{collection.collection_id}</h2>
              <CollectionStatusBadge status={collection.status} />
              <PriorityBadge priority={collection.priority} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Collection Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Patient</dt>
                <dd className="font-medium">
                  <Link href={`/patients/${collection.patient_id}`} className="text-blue-600 hover:underline">
                    {collection.patients?.full_name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{collection.patients?.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-800">{collection.patient_addresses?.full_address}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium">{collection.date}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Time Slot</dt>
                <dd className="font-medium">{collection.time_slot}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Zone</dt>
                <dd className="font-medium">{collection.zones?.name ?? <span className="text-amber-500">Unzoned</span>}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Agent</dt>
                <dd className="font-medium">
                  {collection.agents ? (
                    <Link href={`/agents/${collection.agent_id}`} className="text-blue-600 hover:underline">
                      {collection.agents.name}
                    </Link>
                  ) : (
                    <span className="text-amber-500">Unassigned</span>
                  )}
                </dd>
              </div>
              {collection.notes && (
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-800">{collection.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Manual assign */}
          {canWrite && !collection.agent_id && isActive && (
            <div className="bg-white rounded-lg border border-amber-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Manual Assignment</h3>
              <ManualAssignForm collectionId={id} agents={agents} />
            </div>
          )}

          {/* Status update */}
          {canWrite && isActive && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
              <StatusUpdateForm collectionId={id} currentStatus={collection.status} />
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <StatusTimeline history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
