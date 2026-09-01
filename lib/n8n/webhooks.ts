import { triggerN8nWebhook } from './client';

// Named webhook trigger functions
// TODO Phase 10 — implement

export async function notifyReportReady(patientId: string, reportId: string) {
  return triggerN8nWebhook('/webhook/report-ready', {
    event: 'report.ready',
    data: { patientId, reportId },
    timestamp: new Date().toISOString(),
  });
}

export async function notifyCollectionDelayed(collectionId: string) {
  return triggerN8nWebhook('/webhook/collection-delayed', {
    event: 'collection.delayed',
    data: { collectionId },
    timestamp: new Date().toISOString(),
  });
}
