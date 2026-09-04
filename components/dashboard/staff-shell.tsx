'use client';

import { useState } from 'react';
import type { User } from '@/types/auth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/topbar';

export function StaffShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="staff-app min-h-dvh md:h-screen md:flex md:overflow-hidden">
      <div className="hidden md:flex md:h-full">
        <Sidebar user={user} />
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-hp-ink/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="relative h-full w-[min(18rem,88vw)]">
            <Sidebar user={user} onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-dvh md:min-h-0 md:overflow-hidden">
        <TopBar user={user} onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
