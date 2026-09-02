import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { patientService } from '@/services/patient.service';
import { TicketForm } from '@/components/tickets/ticket-form';

interface PageProps {
  searchParams: Promise<{ patient_id?: string }>;
}

export default async function NewTicketPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  if (!hasPermission(user.role, 'tickets:write')) {
    return <p className="text-sm text-red-600">You do not have permission to create tickets.</p>;
  }

  const params = await searchParams;
  const { patients } = await patientService.getPatients({ limit: 100 });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/tickets" className="text-sm text-gray-500 hover:text-gray-700">← Tickets</Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-2xl font-bold text-gray-900">New Ticket</h2>
      </div>
      <TicketForm patients={patients} defaultPatientId={params.patient_id} />
    </div>
  );
}
