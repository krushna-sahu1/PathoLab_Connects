'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function WhatsAppSimulator() {
  const router = useRouter();
  const [from, setFrom] = useState('9100000001');
  const [body, setBody] = useState('hi');
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send');
        return;
      }
      setReply(data.reply);
      setBody('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
      <h3 className="font-semibold text-gray-900">Mock inbound message</h3>
      <p className="text-xs text-gray-500">
        Uses the mock WhatsApp provider. Seed patient phones: 9100000001–9100000005.
      </p>
      {error && <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      {reply && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 whitespace-pre-wrap">
          {reply}
        </div>
      )}
      <input
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder="Patient phone"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message (try hi, 1, 2, 5…)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={pending || !from || !body}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send as patient'}
      </button>
    </form>
  );
}
