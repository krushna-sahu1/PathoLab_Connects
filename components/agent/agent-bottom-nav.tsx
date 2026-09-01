'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/agent', label: 'Today', icon: '🏠' },
  { href: '/agent/jobs', label: 'All Jobs', icon: '📋' },
  { href: '/agent/profile', label: 'Profile', icon: '👤' },
] as const;

export function AgentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="grid grid-cols-3">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/agent' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
              {isActive && <span className="absolute bottom-0 h-0.5 w-8 bg-blue-600 rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
