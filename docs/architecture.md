# Architecture

## Overview
Hypatho Connects uses a monorepo Next.js App Router architecture deployed on Vercel, with Supabase as the backend (PostgreSQL, Auth, Storage, Realtime), Twilio for WhatsApp, and n8n for automation.

## Core Relationship
```
Patient → Address → Zone → Agent → Collection → Sample → Report
```

## Key Decisions
- **No microservices**: Single Next.js application. Keep it simple for V1.
- **Provider abstraction**: Twilio and n8n are behind abstractions (`IWhatsAppProvider`, n8n client) so mocks can be used in development.
- **Business logic in app**: Core rules (zone resolution, agent assignment, status transitions) live in the Next.js app — NOT in n8n.
- **Notifications in app (V1)**: WhatsApp outbound messages are sent from `services/notification.service.ts`. n8n remains a placeholder for a later automation layer.
- **RBAC centralized**: All role/permission checks go through `lib/auth/permissions.ts`.
- **Supabase RLS**: Row Level Security will be enabled per-table in Phase 1.
