'use client';

export function JobDateFilter({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="GET">
      <input
        type="date"
        name="date"
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => e.currentTarget.form?.submit()}
      />
    </form>
  );
}
