/**
 * Local / CI smoke for Web Push VAPID configuration.
 * Does not deliver to a real browser unless PUSH_SMOKE_ENDPOINT (+ keys) are set.
 *
 * Usage:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... node scripts/push-smoke.mjs
 */
import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'https://patholab-connects.vercel.app';

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

if (!publicKey) fail('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing');
if (!privateKey) fail('VAPID_PRIVATE_KEY is missing');

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} catch (err) {
  fail(`setVapidDetails rejected keys: ${err instanceof Error ? err.message : err}`);
}

console.log('OK: VAPID keypair accepted by web-push');
console.log(`OK: subject=${subject}`);
console.log(`OK: publicKeyPrefix=${publicKey.slice(0, 12)}…`);

const endpoint = process.env.PUSH_SMOKE_ENDPOINT;
const p256dh = process.env.PUSH_SMOKE_P256DH;
const auth = process.env.PUSH_SMOKE_AUTH;

if (!endpoint || !p256dh || !auth) {
  console.log('SKIP: no PUSH_SMOKE_ENDPOINT/P256DH/AUTH — keypair smoke only');
  process.exit(0);
}

const payload = JSON.stringify({
  title: 'New collection job',
  body: 'Smoke Patient · 8:00–10:00 AM',
  url: '/agent',
});

try {
  const result = await webpush.sendNotification(
    { endpoint, keys: { p256dh, auth } },
    payload
  );
  console.log(`OK: push delivered statusCode=${result.statusCode}`);
} catch (err) {
  fail(`sendNotification failed: ${err instanceof Error ? err.message : err}`);
}
