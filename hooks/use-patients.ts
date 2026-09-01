'use client';

import { useState, useEffect } from 'react';
import type { Patient } from '@/types/patient';

interface UsePatientsOptions {
  search?: string;
  status?: string;
  page?: number;
}

export function usePatients(options: UsePatientsOptions = {}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (options.search) params.set('search', options.search);
    if (options.status) params.set('status', options.status);
    if (options.page) params.set('page', String(options.page));

    setLoading(true);
    fetch(`/api/patients?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? []);
        setTotal(data.total ?? 0);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [options.search, options.status, options.page]);

  return { patients, total, loading, error };
}
