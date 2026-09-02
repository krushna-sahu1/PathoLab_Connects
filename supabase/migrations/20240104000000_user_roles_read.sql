-- Allow the session user to load their own role mapping (needed for RBAC).
CREATE POLICY "user_roles: user can read own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
