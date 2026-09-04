'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validation/auth';
import { firstZodMessage } from '@/lib/utils/zod';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: agentRecord } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .maybeSingle();

    router.push(agentRecord ? '/agent' : '/dashboard');
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-hp-paper border border-hp-sand-2 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 space-y-6"
    >
      {error && (
        <div className="rounded-xl bg-hp-copper/10 p-4 text-sm text-hp-copper-deep border border-hp-copper/30">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-hp-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full min-h-12 rounded-xl border border-hp-sand-2 bg-hp-sand px-4 py-3 text-base text-hp-ink placeholder-hp-ink-muted focus:outline-none focus:ring-2 focus:ring-hp-ink"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-hp-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full min-h-12 rounded-xl border border-hp-sand-2 bg-hp-sand px-4 py-3 text-base text-hp-ink placeholder-hp-ink-muted focus:outline-none focus:ring-2 focus:ring-hp-ink"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-12 rounded-xl bg-hp-ink px-4 py-3 text-base font-semibold text-hp-paper disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
