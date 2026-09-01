# Database Schema

Uses Supabase PostgreSQL.

## Core Tables

| Table | Description |
|---|---|
| users | Platform users (extends auth.users) |
| roles | Role definitions |
| permissions | Permission definitions |
| user_roles | User ↔ Role mapping |
| patients | Patient profiles |
| patient_addresses | Patient addresses with zone linkage |
| zones | Geographic/logistics zones |
| zone_rules | Rules for zone matching |
| agents | Collection/delivery agents |
| agent_availability | Daily agent availability |
| collections | Sample collection requests |
| collection_status_history | Status audit trail |
| samples | Samples linked to collections |
| sample_status_history | Sample status audit trail |
| reports | Patient reports |
| tickets | Support tickets |
| ticket_messages | Ticket message thread |
| whatsapp_conversations | WhatsApp conversation threads |
| whatsapp_messages | Individual WhatsApp messages |
| notifications | In-app notifications |
| audit_logs | System-wide audit log |

## Migration
See `supabase/migrations/`
