import type { Metadata } from 'next';
import { AgentBottomNav } from '@/components/agent/agent-bottom-nav';

export const metadata: Metadata = {
  title: 'Hypatho — Agent App',
  description: 'Field agent mobile interface',
  appleWebApp: {
    capable: true,
    title: 'Hypatho Agent',
    statusBarStyle: 'default',
  },
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">H</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Hypatho Agent</span>
        </div>
      </header>

      {/* Page content with bottom padding for nav bar */}
      <main className="flex-1 px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <AgentBottomNav />
    </div>
  );
}
