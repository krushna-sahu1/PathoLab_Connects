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
  { label: 'Users', href: '/users', icon: '👥', permission: 'users:read' },
  { label: 'Audit Logs', href: '/audit-logs', icon: '📋', permission: 'audit:read' },
  { label: 'Settings', href: '/settings', icon: '⚙️', permission: 'settings:read' },
];

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(user.role, item.permission)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Hypatho</h1>
        <p className="text-xs text-gray-500 mt-0.5">Connects</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
