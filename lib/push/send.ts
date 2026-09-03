import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatAgentJobPush } from '@/lib/push/payload';

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || process.env.NEXT_PUBLIC_APP_URL || 'https://patholab-connects.vercel.app';
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject.startsWith('mailto:') || subject.startsWith('http') ? subject : `https://${subject}`, publicKey, privateKey);
  return true;
}

export async function notifyAgentJob(params: {
  agentId: string;
  kind: 'assigned' | 'cancelled';
  patientName: string;
  timeSlot: string;
}) {
  if (!configureVapid()) {
    console.warn('[push] VAPID keys are not configured; skipping agent push');
    return;
  }

  const payload = JSON.stringify(formatAgentJobPush(params.kind, params.patientName, params.timeSlot));
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('agent_id', params.agentId);

  if (error || !rows?.length) return;

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          payload
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from('push_subscriptions').delete().eq('id', row.id);
        } else {
          console.error('[push] send failed', err);
        }
      }
    })
  );
}
