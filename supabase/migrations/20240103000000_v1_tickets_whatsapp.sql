-- ============================================================
-- V1 follow-up: reports extras, WhatsApp conversation state,
-- unique report-per-sample, staff read policies
-- ============================================================

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS lab_remarks TEXT;

ALTER TABLE public.whatsapp_conversations
  ADD COLUMN IF NOT EXISTS menu_state TEXT NOT NULL DEFAULT 'main';

ALTER TABLE public.whatsapp_conversations
  ADD COLUMN IF NOT EXISTS context JSONB NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone_unique
  ON public.whatsapp_conversations(phone);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_sample_id_unique
  ON public.reports(sample_id);

-- Staff can read lab + support + WhatsApp records (writes go through the service-role client)
CREATE POLICY "samples: staff can read"
  ON public.samples FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sample_status_history: staff can read"
  ON public.sample_status_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "reports: staff can read"
  ON public.reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tickets: staff can read"
  ON public.tickets FOR SELECT
  USING (public.get_user_role() IN ('super_admin', 'operations_admin', 'support_agent'));

CREATE POLICY "ticket_messages: staff can read"
  ON public.ticket_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "whatsapp_conversations: staff can read"
  ON public.whatsapp_conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "whatsapp_messages: staff can read"
  ON public.whatsapp_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "zones: staff can read"
  ON public.zones FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "zone_rules: staff can read"
  ON public.zone_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "agents: staff can read"
  ON public.agents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "agent_availability: staff can read"
  ON public.agent_availability FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "patient_addresses: staff can read"
  ON public.patient_addresses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "collection_status_history: staff can read"
  ON public.collection_status_history FOR SELECT
  USING (auth.uid() IS NOT NULL);
