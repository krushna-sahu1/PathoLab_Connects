export function formatAgentJobPush(kind: 'assigned' | 'cancelled', patientName: string, timeSlot: string) {
  const name = patientName.trim() || 'Patient';
  const slot = timeSlot.trim() || 'time TBC';
  return {
    title: kind === 'assigned' ? 'New collection job' : 'Job cancelled',
    body: `${name} · ${slot}`,
    url: '/agent' as const,
  };
}
