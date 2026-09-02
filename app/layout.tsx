import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterServiceWorker } from '@/components/agent/register-service-worker';

export const metadata: Metadata = {
  title: 'Hypatho Connects',
  description: 'Pathology Patient & Logistics Platform',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
