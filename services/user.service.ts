import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User, UserRole } from '@/types/auth';

export type UserWithRole = User & { role: UserRole };

export const userService = {
  async listUsers() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, is_active, created_at, updated_at, user_roles(roles(name))')
      .order('full_name');
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const roles = row.user_roles as { roles?: { name?: string } }[] | null;
      return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        role: (roles?.[0]?.roles?.name ?? 'viewer') as UserRole,
      } satisfies UserWithRole;
    });
  },

  async createUser(input: {
    email: string;
    full_name: string;
    role: UserRole;
    password: string;
  }) {
    const admin = createAdminClient();
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name },
    });
    if (authError || !created.user) {
      throw new Error(authError?.message ?? 'Failed to create auth user');
    }

    const { error: profileError } = await admin.from('users').insert({
      id: created.user.id,
      email: input.email,
      full_name: input.full_name,
      is_active: true,
    });
    if (profileError) throw new Error(profileError.message);

    const { data: role } = await admin.from('roles').select('id').eq('name', input.role).single();
    if (!role) throw new Error(`Role ${input.role} not found`);

    const { error: roleError } = await admin.from('user_roles').insert({
      user_id: created.user.id,
      role_id: role.id,
    });
    if (roleError) throw new Error(roleError.message);

    return created.user.id;
  },

  async setRole(userId: string, role: UserRole) {
    const admin = createAdminClient();
    const { data: roleRow } = await admin.from('roles').select('id').eq('name', role).single();
    if (!roleRow) throw new Error(`Role ${role} not found`);

    await admin.from('user_roles').delete().eq('user_id', userId);
    const { error } = await admin.from('user_roles').insert({
      user_id: userId,
      role_id: roleRow.id,
    });
    if (error) throw new Error(error.message);
  },

  async setActive(userId: string, isActive: boolean) {
    const admin = createAdminClient();
    const { error } = await admin
      .from('users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw new Error(error.message);
  },
};
