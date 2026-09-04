'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/auth';

interface TopBarProps {
  user: User;
  onOpenNav?: () => void;
}

export function TopBar({ user, onOpenNav }: TopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="min-h-14 bg-hp-paper border-b border-hp-sand-2 flex items-center gap-3 px-4 md:px-6">
      {onOpenNav ? (
        <button
          type="button"
          onClick={onOpenNav}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-hp-ink -ml-1"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      ) : null}
      <div className="flex-1" />
      <span className="text-sm text-hp-ink-muted truncate max-w-[45vw] sm:max-w-none">{user.email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="shrink-0 min-h-11 px-2 text-sm font-semibold text-hp-ink-muted"
      >
        Sign out
      </button>
    </header>
  );
}
