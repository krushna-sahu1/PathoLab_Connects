'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function EnableAgentPush() {
  const [status, setStatus] = useState<'idle' | 'on' | 'blocked' | 'missing'>('idle');
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!publicKey) {
      setStatus('missing');
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;
    (async () => {
      const perm = Notification.permission;
      if (perm === 'denied') {
        setStatus('blocked');
        return;
      }
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!cancelled && res.ok) setStatus('on');
    })().catch(() => {
      if (!cancelled) setStatus('idle');
    });

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  async function enable() {
    if (!publicKey) return;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      setStatus('blocked');
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });
    if (res.ok) setStatus('on');
  }

  if (status === 'missing') return null;
  if (status === 'on') {
    return <p className="text-[11px] text-green-700">Job alerts on</p>;
  }

  return (
    <button
      type="button"
      onClick={() => void enable()}
      className="text-[11px] font-medium text-blue-600 hover:underline"
    >
      {status === 'blocked' ? 'Notifications blocked' : 'Enable job alerts'}
    </button>
  );
}
