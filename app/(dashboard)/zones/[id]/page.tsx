import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { zoneService } from '@/services/zone.service';
import { ZoneRuleList } from '@/components/zones/zone-rule-list';
import { ZoneRuleForm } from '@/components/zones/zone-rule-form';
import { agentService } from '@/services/agent.service';
import { ZoneAgentAssignForm } from '@/components/zones/zone-agent-assign-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ZoneDetailPage({ params }: PageProps) {
  const user = await requireAuth();
  const canWrite = hasPermission(user.role, 'zones:write');
  const { id } = await params;

  let zone;
  try {
    zone = await zoneService.getZoneById(id);
  } catch {
    notFound();
  }

  const rules = zone.zone_rules ?? [];
  const agents = canWrite ? await agentService.getAgents({ includeInactive: true }) : [];
  const pincodeRules = rules.filter((r) => r.rule_type === 'pincode');
  const sectorRules = rules.filter((r) => r.rule_type === 'sector');
  const areaRules = rules.filter((r) => r.rule_type === 'area');

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/zones" className="text-sm text-gray-500 hover:text-gray-700">← Zones</Link>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{zone.name}</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                zone.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {zone.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {canWrite && (
          <Link
            href={`/zones/${id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Zone
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Zone Details</h3>
            <dl className="space-y-2 text-sm">
              {zone.description && (
                <div>
                  <dt className="text-gray-500">Description</dt>
                  <dd className="text-gray-800">{zone.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Daily Capacity</dt>
                <dd className="font-semibold text-gray-800">{zone.daily_capacity} collections/day</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Rules</dt>
                <dd className="font-semibold text-gray-800">{rules.length}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Agent Assignment</h3>
            {canWrite ? (
              <ZoneAgentAssignForm
                zoneId={id}
                agents={agents}
                primaryAgentId={zone.primary_agent_id}
                backupAgentId={zone.backup_agent_id}
              />
            ) : (
              <p className="text-sm text-gray-600">
                Primary and backup agents are used by auto-assignment.
              </p>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Zone Rules</h3>
            <p className="text-sm text-gray-500 mb-4">
              Rules determine which patient addresses are automatically assigned to this zone.
              Priority: <span className="font-medium">Pincode</span> &gt; Sector &gt; Area.
            </p>

            <div className="space-y-4">
              <ZoneRuleSection title="Pincode Rules" rules={pincodeRules} zoneId={id} canWrite={canWrite} />
              <ZoneRuleSection title="Sector Rules" rules={sectorRules} zoneId={id} canWrite={canWrite} />
              <ZoneRuleSection title="Area Rules" rules={areaRules} zoneId={id} canWrite={canWrite} />
            </div>
          </div>

          {canWrite && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Add Rule</h3>
              <ZoneRuleForm zoneId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZoneRuleSection({
  title,
  rules,
  zoneId,
  canWrite,
}: {
  title: string;
  rules: import('@/types/zone').ZoneRule[];
  zoneId: string;
  canWrite: boolean;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      {rules.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} defined</p>
      ) : (
        <ZoneRuleList rules={rules} zoneId={zoneId} canWrite={canWrite} />
      )}
    </div>
  );
}
