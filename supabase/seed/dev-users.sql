-- ============================================================
-- DEV USERS SEED — NOT FOR PRODUCTION
-- Run AFTER creating test users in Supabase Auth dashboard
-- Replace UUIDs with actual Supabase auth user IDs
-- ============================================================

-- Example: Insert into public.users after auth user creation
-- INSERT INTO public.users (id, email, full_name, is_active)
-- VALUES ('AUTH_USER_UUID', 'admin@dev.test', 'Dev Admin', true);

-- Example: Assign super_admin role
-- INSERT INTO public.user_roles (user_id, role_id)
-- SELECT 'AUTH_USER_UUID', id FROM public.roles WHERE name = 'super_admin';

-- Instructions:
-- 1. Create users in Supabase Auth dashboard (or via API)
-- 2. Copy their UUIDs
-- 3. Run INSERT statements above with real UUIDs
-- 4. Assign roles using the user_roles table

SELECT 'Dev users seed instructions — see comments above' AS info;
