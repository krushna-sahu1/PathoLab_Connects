# Pathology Patient & Logistics Platform — V1 Plan

## 1. Purpose

Build a centralized Patient & Logistics Management Platform for a pathology/diagnostic company.

V1 focuses ONLY on individual patients.

The current business process depends on:

- WhatsApp conversations and multiple WhatsApp groups
- Excel sheets
- Manual patient tracking
- Manual assignment of sample-collection/delivery agents
- Manual coordination between operations and agents

This becomes difficult to scale as patients, locations, and agents increase.

The goal is to replace:

**WhatsApp Groups + Excel + Manual Coordination**

with:

**Central Platform + Automated Logistics + WhatsApp + Operations Dashboard**

---

## 2. Core Business Flow

The central relationship is:

**Patient → Address → Zone → Agent → Collection → Sample → Report**

WhatsApp is the patient communication channel.

The platform is the source of truth.

n8n is the automation/integration layer.

---

## 3. V1 Scope

V1 includes:

- Individual patients
- Patient profiles
- Multiple patient addresses
- Location/zone management
- Agent management
- Collection logistics
- Sample tracking
- Reports
- Support tickets
- WhatsApp automation
- Operations dashboard
- Users, roles, and permissions
- Audit history

Do NOT build clinics, hospitals, or corporate customers in V1.

The architecture should remain extensible so those can be added later.

---

# 4. Patient Management

Every patient has a unique Patient ID.

Patient information:

- Patient ID
- Full name
- Phone
- Email
- Date of birth
- Gender
- Status
- Created date
- Updated date

Patients can have multiple addresses.

Address information:

- Address label: Home / Office / Other
- Full address
- Area
- Sector
- Pincode
- Latitude
- Longitude
- Zone
- Primary address

The Patient 360 view should eventually show:

- Patient details
- Addresses
- Collection history
- Sample history
- Reports
- Support tickets
- Activity/audit history

---

# 5. Zone Management

Zones are the foundation of logistics.

Example:

- Sector 1 → Zone 1 → Rahul
- Sector 2 → Zone 2 → Amit
- Sector 3 → Zone 3 → Suresh
- Sector 4 → Zone 4 → Priya

Zone assignment must NOT be hard-coded.

A zone can contain rules based on:

- Pincode
- Area
- Sector

Each zone supports:

- Zone name
- Description
- Areas
- Sectors
- Pincodes
- Primary agent
- Backup agent
- Daily capacity
- Active/inactive status

Future versions may support GPS/geofencing.

If no zone matches an address, the request should go to a manual operations queue.

---

# 6. Agent Management

Agents are responsible for collection/delivery tasks.

Agent information:

- Name
- Phone
- Email
- Status
- Role
- Primary zone
- Backup zones
- Daily capacity
- Working days
- Availability

Agent statuses:

- Available
- Busy
- Offline
- On Leave
- Inactive

Agent dashboard should show:

- Today's assignments
- Completed tasks
- Pending tasks
- Failed tasks
- Performance

Agents should only access their own assigned work.

---

# 7. Collection Management

A collection represents a patient's sample collection request.

Collection fields:

- Collection ID
- Patient
- Address
- Zone
- Agent
- Date
- Time slot
- Priority
- Notes
- Status
- Created at
- Updated at

Main workflow:

**NEW → ASSIGNED → ACCEPTED → ON_THE_WAY → ARRIVED → COLLECTED**

Additional statuses:

- FAILED
- CANCELLED
- RESCHEDULED

Every status transition must eventually record:

- Previous status
- New status
- Timestamp
- User/agent
- Optional remark

---

# 8. Agent Assignment

When a collection is created:

1. Determine the patient's zone.
2. Find the zone's primary agent.
3. Check whether the agent is active and available.
4. Check daily capacity.
5. If unavailable/full, try the backup agent.
6. If nobody is available, put the collection into the Operations Queue.

Core assignment logic belongs in the main application, NOT n8n.

The architecture should allow a smarter algorithm later using:

- Distance
- Workload
- Availability
- Time slot
- Priority

Do not use AI for this in V1.

---

# 9. Agent Mobile Experience

The agent interface should be mobile-first.

For each assigned collection, show:

- Patient name
- Address
- Phone
- Time slot
- Notes
- Navigate
- Call

Actions:

- Accept
- On The Way
- Arrived
- Sample Collected
- Unable to Collect

If the agent selects Unable to Collect, require a reason:

- Patient unavailable
- Wrong address
- Patient cancelled
- No response
- Address inaccessible
- Other

Allow an optional remark.

---

# 10. Sample Tracking

A sample is linked to a collection.

Sample workflow:

**COLLECTED → IN_TRANSIT → RECEIVED_AT_LAB → ACCEPTED → PROCESSING → TESTING → REPORT_READY**

Sample status history should be tracked separately from collection status history.

---

# 11. Reports

Reports are linked to patients and samples.

Report information:

- Report status
- Report file
- Report date
- Report ready timestamp

Use secure storage.

Do not expose sensitive medical reports through unrestricted public URLs.

---

# 12. Support Tickets

Patients can raise queries.

Categories:

- Sample Collection
- Report
- Delivery
- Billing
- Other

Ticket workflow:

**OPEN → ASSIGNED → IN_PROGRESS → WAITING → RESOLVED → CLOSED**

Tickets should contain:

- Ticket ID
- Patient
- Category
- Description
- Priority
- Assigned support user
- Status
- Created at
- Resolved at
- Messages

---

# 13. WhatsApp

Use Twilio WhatsApp API.

WhatsApp is the patient's main communication interface.

Main menu:

1. Book Sample Collection
2. Track My Collection
3. Track My Sample
4. Get My Report
5. Raise a Query
6. Talk to Support

The system should eventually support:

- Identify/create patient by phone
- Menu handling
- Collection booking
- Collection tracking
- Sample tracking
- Report notifications
- Support ticket creation
- Status notifications

The architecture must use a provider abstraction so development can use a mock provider before real Twilio credentials are available.

Example:

**MockWhatsAppProvider → TwilioWhatsAppProvider**

Business logic must not depend directly on Twilio.

---

# 14. n8n

n8n is a REQUIRED V1 automation/integration component.

n8n should be used for repetitive external automation such as:

- Report-ready WhatsApp notification
- Delayed collection alerts
- Daily logistics summaries
- Email/SMS integrations
- Future external system integrations

Important separation:

### Main application

Handles:

- Patient management
- Zone assignment
- Agent assignment
- Collection management
- Sample management
- Permissions
- Core business rules

### n8n

Handles:

- What should happen AFTER an event
- Notifications
- External integrations
- Scheduled automation

Do NOT put core business logic inside n8n.

n8n will be self-hosted separately, not deployed as part of Vercel.

---

# 15. Technology Direction

Use a Vercel + Supabase friendly architecture.

Preferred stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel
- Twilio WhatsApp
- n8n

Use current stable versions available at implementation time.

Supabase provides:

- PostgreSQL
- Authentication
- Storage
- Realtime where useful

Do not introduce unnecessary infrastructure such as:

- Microservices
- Kubernetes
- Kafka
- Redis
- NestJS

unless there is a clear future requirement.

Keep V1 simple and maintainable.

---

# 16. Roles

V1 roles:

### Super Admin

Full access to the platform, users, permissions, configuration, data, and audit logs.

### Operations Admin

Manages patients, zones, agents, collections, and operational data.

### Logistics Manager

Manages logistics operations, agents, assignments, and collection performance.

### Collection Agent

Only sees and manages assigned collections.

### Support Agent

Manages patient queries and support tickets.

### Viewer

Read-only access to permitted dashboards and information.

Use proper RBAC.

Do not scatter role checks throughout the application.

Important administrative actions must be auditable.

---

# 17. Database Structure

Use Supabase PostgreSQL.

Core entities:

- users
- roles
- permissions
- user_roles
- patients
- patient_addresses
- zones
- zone_rules
- agents
- agent_availability
- collections
- collection_status_history
- samples
- sample_status_history
- reports
- tickets
- ticket_messages
- whatsapp_conversations
- whatsapp_messages
- notifications
- audit_logs

Use:

- UUIDs
- Foreign keys
- Proper indexes
- Constraints
- created_at
- updated_at

Prepare for Supabase Row Level Security.

---

# 18. Project Architecture

Use a clean, modular, professional structure.

Suggested structure:

```text
project/
│
├── app/
│   ├── (auth)/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── collections/
│   │   ├── zones/
│   │   ├── agents/
│   │   ├── samples/
│   │   ├── reports/
│   │   ├── tickets/
│   │   ├── users/
│   │   ├── audit-logs/
│   │   └── settings/
│   │
│   ├── agent/
│   │
│   └── api/
│       ├── patients/
│       ├── collections/
│       ├── reports/
│       ├── tickets/
│       ├── whatsapp/
│       └── webhooks/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── patients/
│   ├── collections/
│   ├── zones/
│   ├── agents/
│   ├── samples/
│   ├── reports/
│   ├── tickets/
│   └── shared/
│
├── features/
│   ├── patients/
│   ├── logistics/
│   ├── zones/
│   ├── agents/
│   ├── collections/
│   ├── samples/
│   ├── reports/
│   ├── tickets/
│   └── whatsapp/
│
├── lib/
│   ├── supabase/
│   ├── twilio/
│   ├── n8n/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── utils/
│
├── services/
├── hooks/
├── types/
├── config/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│
├── public/
│
├── .env.example
├── README.md
└── package.json
```

The agent may improve this structure if a clearly better architecture exists, but must avoid over-engineering.

Avoid giant files and duplicated logic.

---

# 19. Mock Data

Create realistic but completely fictional development data.

Patients:

- Rahul Sharma
- Anita Das
- Sanjay Kumar
- Priya Mishra
- Arjun Patel

Zones:

- Zone 1 — Sector 1
- Zone 2 — Sector 2
- Zone 3 — Sector 3
- Zone 4 — Sector 4

Agents:

- Rahul
- Amit
- Suresh
- Priya

Relationships:

- Sector 1 → Zone 1 → Rahul
- Sector 2 → Zone 2 → Amit
- Sector 3 → Zone 3 → Suresh
- Sector 4 → Zone 4 → Priya

Also create mock data structures for:

- Collections
- Samples
- Reports
- Tickets
- Users
- Agent availability
- Status history
- Notifications

All mock data must be clearly marked as development/test data.

---

# 20. Twilio Architecture

Prepare a clean abstraction:

```text
lib/twilio/
├── client.ts
├── whatsapp.ts
├── templates.ts
├── types.ts
└── mock-provider.ts
```

Environment variables:

```text
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER
```

Never hard-code credentials.

---

# 21. n8n Architecture

Prepare:

```text
lib/n8n/
├── client.ts
├── webhooks.ts
└── types.ts
```

Documentation for future workflows:

```text
docs/n8n/
├── report-ready.md
├── collection-delayed.md
├── daily-logistics-summary.md
└── whatsapp-notifications.md
```

Do not implement real n8n workflows during architecture phase.

---

# 22. Documentation

Create:

```text
docs/
├── architecture.md
├── database.md
├── roles-and-permissions.md
├── logistics-workflow.md
├── whatsapp-workflow.md
├── n8n-integrations.md
└── development-phases.md
```

Documentation should explain important architectural decisions and assumptions.

---

# 23. Development Process

Development should happen in phases.

### Phase 0 — Architecture

Create:

- Folder structure
- Configuration
- Database migration structure
- Types
- Mock/seed structure
- Documentation
- Integration abstractions

Then STOP.

### Phase 1

Authentication + RBAC + Supabase

### Phase 2

Patients + addresses

### Phase 3

Zones + zone rules

### Phase 4

Agents + availability

### Phase 5

Collections + assignment engine

### Phase 6

Agent mobile interface

### Phase 7

Samples + reports

### Phase 8

Tickets

### Phase 9

Twilio WhatsApp

### Phase 10

n8n automations and notifications

Do not implement everything at once.

After each phase, test the previous functionality before continuing.

---

# 24. Important Engineering Rules

- Use current stable package versions.
- Use TypeScript strictly.
- Keep modules separated.
- Keep business logic separate from UI.
- Keep integrations behind service/provider abstractions.
- Validate server-side.
- Never trust client-provided permissions.
- Use Supabase RLS appropriately.
- Protect sensitive patient/report data.
- Create audit logs for important actions.
- Do not hard-code credentials.
- Do not use AI/LLMs for core V1 business logic.
- Do not use Excel as the source of truth.
- Excel may later be supported for import/export.
- Do not build WhatsApp groups.
- Do not put core business rules in n8n.
- Keep V1 simple and production-minded.

---

# 25. Phase 0 Instruction for Coding Agent

When this document is provided to the coding agent:

**First read and understand this entire plan.**

Then create ONLY the architecture, folder structure, configuration, schema/migration structure, mock/seed structure, abstractions, and documentation described above.

Do NOT implement the actual application features yet.

Do NOT build real CRUD.

Do NOT build real WhatsApp/Twilio functionality.

Do NOT build real n8n workflows.

Do NOT build full authentication/business logic.

After the structure is created, report what was created and STOP.

Wait for the explicit instruction:

**"Start implementation."**

Only then begin implementing the application module-by-module.
