-- ============================================================
-- Row Level Security Policies
-- Phase 1 — basic RLS setup
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT r.name
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper to check if current user is super_admin or operations_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('super_admin', 'operations_admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---- users ----
CREATE POLICY "users: admins can read all"
  ON public.users FOR SELECT
  USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "users: user can read own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- ---- roles & permissions (read-only for all authenticated) ----
CREATE POLICY "roles: authenticated can read"
  ON public.roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "permissions: authenticated can read"
  ON public.permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ---- patients ----
CREATE POLICY "patients: staff can read"
  ON public.patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "patients: admins can write"
  ON public.patients FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "patients: admins can update"
  ON public.patients FOR UPDATE
  USING (public.is_admin());

-- ---- collections ----
CREATE POLICY "collections: staff can read"
  ON public.collections FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "collections: agents can read own"
  ON public.collections FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- ---- audit_logs ----
CREATE POLICY "audit_logs: super_admin can read"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() = 'super_admin');

-- ---- notifications ----
CREATE POLICY "notifications: user can read own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());
