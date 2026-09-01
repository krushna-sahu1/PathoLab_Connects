'use client';

import { useTransition } from 'react';
import { deleteAddressAction } from '@/app/actions/patient.actions';
import type { PatientAddress } from '@/types/patient';

interface AddressListProps {
  addresses: PatientAddress[];
  patientId: string;
  canWrite: boolean;
}

export function AddressList({ addresses, patientId, canWrite }: AddressListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Addresses
        <span className="ml-2 text-sm font-normal text-gray-400">({addresses.length})</span>
      </h3>

      {addresses.length === 0 ? (
        <p className="text-sm text-gray-400">No addresses on file</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              patientId={patientId}
              canWrite={canWrite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddressCard({
  address,
  patientId,
  canWrite,
}: {
  address: PatientAddress;
  patientId: string;
  canWrite: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Delete this address?')) return;
    startTransition(async () => {
      await deleteAddressAction(address.id, patientId);
    });
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        address.is_primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {address.label}
            </span>
            {address.is_primary && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                Primary
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800">{address.full_address}</p>
          <p className="text-xs text-gray-500">
            {[address.area, address.sector, address.pincode].filter(Boolean).join(', ')}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 shrink-0"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
