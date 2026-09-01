'use client';

import { useTransition } from 'react';
import { deleteZoneRuleAction } from '@/app/actions/zone.actions';
import type { ZoneRule } from '@/types/zone';

interface ZoneRuleListProps {
  rules: ZoneRule[];
  zoneId: string;
  canWrite: boolean;
}

export function ZoneRuleList({ rules, zoneId, canWrite }: ZoneRuleListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {rules.map((rule) => (
        <ZoneRuleChip key={rule.id} rule={rule} zoneId={zoneId} canWrite={canWrite} />
      ))}
    </div>
  );
}

function ZoneRuleChip({
  rule,
  zoneId,
  canWrite,
}: {
  rule: ZoneRule;
  zoneId: string;
  canWrite: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Remove rule "${rule.rule_value}"?`)) return;
    startTransition(async () => {
      await deleteZoneRuleAction(rule.id, zoneId);
    });
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      {rule.rule_value}
      {canWrite && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors text-xs font-bold leading-none"
          aria-label={`Remove ${rule.rule_value}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
