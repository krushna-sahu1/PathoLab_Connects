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

## V1 note
Outbound WhatsApp notifications currently run in the main application (`notificationService`). These n8n workflows are documented for a later automation layer and are not wired up.

## Configuration
- `N8N_WEBHOOK_BASE_URL` — base URL of self-hosted n8n instance
- `N8N_API_KEY` — for authenticated webhook calls
