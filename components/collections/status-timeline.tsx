import type { CollectionStatusHistory } from '@/types/collection';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-400',
  assigned: 'bg-blue-500',
  accepted: 'bg-indigo-500',
  on_the_way: 'bg-purple-500',
  arrived: 'bg-yellow-500',
  collected: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-400',
  rescheduled: 'bg-orange-500',
};

export function StatusTimeline({ history }: { history: CollectionStatusHistory[] }) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">No history yet</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-2">
      {sorted.map((entry, i) => (
        <li key={entry.id} className="ml-4">
          <span
            className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full ${STATUS_COLORS[entry.new_status] ?? 'bg-gray-400'} ring-2 ring-white`}
          />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {entry.new_status.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(entry.created_at).toLocaleString('en-IN')}
            </p>
            {entry.remark && (
              <p className="text-xs text-gray-500 italic">{entry.remark}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
