# n8n Integrations

## Purpose
n8n handles post-event automation and external integrations — NOT core business logic.

## Planned Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Report Ready | report status → ready | WhatsApp notification to patient |
| Collection Delayed | collection not updated after scheduled time | Alert to operations |
| Daily Logistics Summary | Cron at end of day | Summary report to logistics manager |
| WhatsApp Notifications | Various events | Outbound messages via Twilio |

## Self-hosted
n8n runs separately — not deployed on Vercel.

## Configuration
- `N8N_WEBHOOK_BASE_URL` — base URL of self-hosted n8n instance
- `N8N_API_KEY` — for authenticated webhook calls
