import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { User } from '@/types/auth';
import type { UserRole } from '@/types/auth';

/**
 * Get the currently authenticated user from the server session.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Fetch the user profile from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('*, user_roles(roles(name))')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: (profile.user_roles?.[0]?.roles?.name ?? 'viewer') as UserRole,
    is_active: profile.is_active,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

/**
 * Server-side guard — redirects to login if not authenticated.
 * Use in Server Components / page.tsx files.
 */
export async function requireAuth(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }
  return user;
}

/**
 * Server-side guard — throws if user doesn't have the required role.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard?error=unauthorized');
  }
  return user;
}
