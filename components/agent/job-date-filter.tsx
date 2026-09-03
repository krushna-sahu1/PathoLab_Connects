'use client';

export function JobDateFilter({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="GET">
      <input
        type="date"
        name="date"
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-hp-sand-2 bg-hp-paper px-4 py-3 text-base min-h-12 text-hp-ink focus:outline-none focus:ring-2 focus:ring-hp-ink"
        onChange={(e) => e.currentTarget.form?.submit()}
      />
    </form>
  );
}
