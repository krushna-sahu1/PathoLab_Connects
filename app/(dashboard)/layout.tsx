import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { StaffShell } from '@/components/dashboard/staff-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return <StaffShell user={user}>{children}</StaffShell>;
}
