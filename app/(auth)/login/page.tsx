import { LoginForm } from '@/components/auth/login-form';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="marketing-page min-h-dvh flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-hp-ink">Hypatho Connects</h1>
          <p className="mt-2 text-sm text-hp-ink-muted">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
