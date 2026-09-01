import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Agent } from '@/types/agent';

/**
 * Get the agent record for the currently logged-in user.
 * Returns null if the user is not associated with any agent.
 */
export async function getAgentForUser(userId: string): Promise<Agent | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as Agent;
}

/**
 * Require agent auth — throws redirect if no agent record found.
 * Use in all /agent/* pages.
 */
export async function requireAgentAuth(): Promise<{ userId: string; agent: Agent }> {
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/login?redirect=/agent');
  }
  const agent = await getAgentForUser(user!.id);
  return { userId: user!.id, agent: agent! };
}
