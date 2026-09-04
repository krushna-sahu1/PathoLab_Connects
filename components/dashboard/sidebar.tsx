'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User, UserRole } from '@/types/auth';
import { hasPermission } from '@/lib/auth/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission: string;
  allowedRoles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠', permission: 'dashboard:read' },
  { label: 'Patients', href: '/patients', icon: '👤', permission: 'patients:read' },
  { label: 'Collections', href: '/collections', icon: '🧪', permission: 'collections:read' },
  { label: 'Zones', href: '/zones', icon: '📍', permission: 'zones:read' },
  { label: 'Agents', href: '/agents', icon: '🚴', permission: 'agents:read' },
  { label: 'Samples', href: '/samples', icon: '🔬', permission: 'samples:read' },
  { label: 'Reports', href: '/reports', icon: '📄', permission: 'reports:read' },
  { label: 'Tickets', href: '/tickets', icon: '🎫', permission: 'tickets:read' },
  { label: 'WhatsApp', href: '/whatsapp', icon: '💬', permission: 'whatsapp:read' },
  { label: 'Users', href: '/users', icon: '👥', permission: 'users:read' },
  { label: 'Audit Logs', href: '/audit-logs', icon: '📋', permission: 'audit:read' },
  { label: 'Settings', href: '/settings', icon: '⚙️', permission: 'settings:read' },
];

interface SidebarProps {
  user: User;
  onNavigate?: () => void;
}

export function Sidebar({ user, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(user.role, item.permission)
  );

  return (
    <aside className="w-64 h-full bg-hp-ink text-hp-paper flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="font-display text-lg font-semibold">Hypatho</h1>
        <p className="text-xs text-hp-sand mt-0.5">Connects</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 min-h-11 px-3 py-2 rounded-xl text-sm font-medium ${
                isActive ? 'bg-hp-copper text-hp-paper' : 'text-hp-sand/90'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-hp-copper flex items-center justify-center text-hp-paper font-semibold text-sm">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-hp-sand/80 truncate">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
