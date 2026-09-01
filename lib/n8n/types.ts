export interface N8nWebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface N8nTriggerResult {
  success: boolean;
  workflowId?: string;
  error?: string;
}
