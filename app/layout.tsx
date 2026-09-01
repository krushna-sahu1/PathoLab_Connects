import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hypatho Connects',
  description: 'Pathology Patient & Logistics Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
