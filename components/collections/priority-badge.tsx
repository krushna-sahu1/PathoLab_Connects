export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'urgent') {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        🔴 Urgent
      </span>
    );
  }
  return null;
}
