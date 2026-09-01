-- ============================================================
-- DEV SEED DATA — NOT FOR PRODUCTION
-- Fictional data only
-- ============================================================

-- Roles
INSERT INTO public.roles (id, name, description) VALUES
  (uuid_generate_v4(), 'super_admin', 'Full platform access'),
  (uuid_generate_v4(), 'operations_admin', 'Manages operations'),
  (uuid_generate_v4(), 'logistics_manager', 'Manages logistics'),
  (uuid_generate_v4(), 'collection_agent', 'Handles collections'),
  (uuid_generate_v4(), 'support_agent', 'Handles support tickets'),
  (uuid_generate_v4(), 'viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Zones
INSERT INTO public.zones (name, description, sectors, pincodes, daily_capacity, is_active) VALUES
  ('Zone 1', 'Sector 1 coverage', ARRAY['Sector 1'], ARRAY['110001'], 20, true),
  ('Zone 2', 'Sector 2 coverage', ARRAY['Sector 2'], ARRAY['110002'], 20, true),
  ('Zone 3', 'Sector 3 coverage', ARRAY['Sector 3'], ARRAY['110003'], 20, true),
  ('Zone 4', 'Sector 4 coverage', ARRAY['Sector 4'], ARRAY['110004'], 20, true);

-- Zone Rules
INSERT INTO public.zone_rules (zone_id, rule_type, rule_value)
SELECT id, 'sector', 'Sector 1' FROM public.zones WHERE name = 'Zone 1'
UNION ALL
SELECT id, 'sector', 'Sector 2' FROM public.zones WHERE name = 'Zone 2'
UNION ALL
SELECT id, 'sector', 'Sector 3' FROM public.zones WHERE name = 'Zone 3'
UNION ALL
SELECT id, 'sector', 'Sector 4' FROM public.zones WHERE name = 'Zone 4';

-- Agents (dev only)
INSERT INTO public.agents (name, phone, email, status, daily_capacity, primary_zone_id)
SELECT 'Rahul (Dev)', '9000000001', 'rahul@dev.test', 'available', 10, id
FROM public.zones WHERE name = 'Zone 1'
UNION ALL
SELECT 'Amit (Dev)', '9000000002', 'amit@dev.test', 'available', 10, id
FROM public.zones WHERE name = 'Zone 2'
UNION ALL
SELECT 'Suresh (Dev)', '9000000003', 'suresh@dev.test', 'available', 10, id
FROM public.zones WHERE name = 'Zone 3'
UNION ALL
SELECT 'Priya (Dev)', '9000000004', 'priya@dev.test', 'available', 10, id
FROM public.zones WHERE name = 'Zone 4';

-- Patients (dev only — completely fictional)
INSERT INTO public.patients (patient_id, full_name, phone, email, gender, status) VALUES
  ('PAT-DEV-001', 'Rahul Sharma (Dev)', '9100000001', 'rahul.sharma@dev.test', 'male', 'active'),
  ('PAT-DEV-002', 'Anita Das (Dev)', '9100000002', 'anita.das@dev.test', 'female', 'active'),
  ('PAT-DEV-003', 'Sanjay Kumar (Dev)', '9100000003', 'sanjay.kumar@dev.test', 'male', 'active'),
  ('PAT-DEV-004', 'Priya Mishra (Dev)', '9100000004', 'priya.mishra@dev.test', 'female', 'active'),
  ('PAT-DEV-005', 'Arjun Patel (Dev)', '9100000005', 'arjun.patel@dev.test', 'male', 'active');
