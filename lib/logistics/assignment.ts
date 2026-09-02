export const UNAVAILABLE_AGENT_STATUSES = ['inactive', 'on_leave', 'offline'] as const;

export function assignmentCandidateIds(
  primaryAgentId?: string | null,
  backupAgentId?: string | null
): string[] {
  return [...new Set([primaryAgentId, backupAgentId].filter(Boolean) as string[])];
}

export function isAgentEligibleForAssignment(input: {
  status: string;
  dailyCapacity: number;
  availability: { isAvailable: boolean; currentLoad: number } | null;
}): boolean {
  if ((UNAVAILABLE_AGENT_STATUSES as readonly string[]).includes(input.status)) return false;
  if (input.availability && !input.availability.isAvailable) return false;
  const load = input.availability?.currentLoad ?? 0;
  return load < input.dailyCapacity;
}

export function selectFirstEligibleId(
  candidates: Array<{ id: string; eligible: boolean }>
): string | null {
  return candidates.find((c) => c.eligible)?.id ?? null;
}
