import type { Metadata } from 'next';
import { AgentBottomNav } from '@/components/agent/agent-bottom-nav';
import { EnableAgentPush } from '@/components/agent/enable-agent-push';

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
    <div className="agent-app min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 bg-hp-ink text-hp-paper px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-hp-copper flex items-center justify-center shrink-0">
            <span className="text-hp-paper text-sm font-bold">H</span>
          </div>
          <span className="font-display font-semibold text-base truncate">Hypatho Agent</span>
        </div>
        <div className="ml-auto shrink-0">
          <EnableAgentPush />
        </div>
      </header>

      <main className="flex-1 px-4 py-5 pb-28 max-w-lg mx-auto w-full">{children}</main>

      <AgentBottomNav />
    </div>
  );
}
