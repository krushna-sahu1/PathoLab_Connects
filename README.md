# Hypatho Connects — Pathology Patient & Logistics Platform

Centralized Patient & Logistics Management Platform for a pathology/diagnostic company.

## V1 Scope
- Individual patient management
- Zone & agent management
- Collection logistics
- Sample tracking
- Reports
- Support tickets
- WhatsApp automation (Twilio)
- Operations dashboard
- RBAC
- Audit history

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Twilio WhatsApp API
- n8n (self-hosted automation)
- Vercel (deployment)

## Development Phases
See [docs/development-phases.md](docs/development-phases.md)

## Getting Started
1. Copy `.env.example` to `.env.local` and fill in values
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
