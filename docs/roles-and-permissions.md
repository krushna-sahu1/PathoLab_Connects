# Roles & Permissions

## Roles

| Role | Description |
|---|---|
| super_admin | Full access to everything |
| operations_admin | Manages patients, zones, agents, collections |
| logistics_manager | Manages logistics, agents, assignments |
| collection_agent | Sees and manages only their own assigned collections |
| support_agent | Manages patient queries and support tickets |
| viewer | Read-only access to permitted dashboards |

## Rules
- Never scatter role checks in UI components.
- All checks go through `lib/auth/permissions.ts`.
- Never trust client-provided permissions — always validate server-side.
- Agents can only access their own assigned work.
