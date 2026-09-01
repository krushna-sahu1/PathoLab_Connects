import type { N8nTriggerResult, N8nWebhookPayload } from './types';

// n8n webhook client
// TODO Phase 10 — implement n8n webhook triggers
export async function triggerN8nWebhook(
  webhookPath: string,
  payload: N8nWebhookPayload
): Promise<N8nTriggerResult> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.warn('[n8n] N8N_WEBHOOK_BASE_URL not set — skipping webhook');
    return { success: false, error: 'N8N_WEBHOOK_BASE_URL not configured' };
  }
  // TODO Phase 10
  console.log(`[n8n] Would trigger ${baseUrl}${webhookPath}`, payload);
  return { success: true };
}
