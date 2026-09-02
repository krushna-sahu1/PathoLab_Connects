'use client';

import type { ReactNode } from 'react';
import { reportDownloadHref } from '@/lib/reports/storage';

export function ReportDownloadLink({
  reportId,
  className,
  children,
}: {
  reportId: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={reportDownloadHref(reportId)} className={className} target="_blank" rel="noopener noreferrer">
      {children ?? 'Download report'}
    </a>
  );
}
