import { describe, expect, it } from 'vitest';
import { formatAgentJobPush } from '@/lib/push/payload';
import { isStorageObjectPath, reportDownloadHref } from '@/lib/reports/storage';

describe('agent push payload', () => {
  it('uses a short title, patient + slot body, and /agent url', () => {
    expect(formatAgentJobPush('assigned', 'Priya Sharma', '8:00–10:00 AM')).toEqual({
      title: 'New collection job',
      body: 'Priya Sharma · 8:00–10:00 AM',
      url: '/agent',
    });
    expect(formatAgentJobPush('cancelled', 'Amit', 'Afternoon')).toMatchObject({
      title: 'Job cancelled',
      url: '/agent',
    });
  });
});

describe('report storage paths', () => {
  it('rejects public http(s) URLs as storage paths', () => {
    expect(isStorageObjectPath('https://bucket.example/report.pdf')).toBe(false);
    expect(isStorageObjectPath('http://localhost/x.pdf')).toBe(false);
  });

  it('accepts private object keys', () => {
    expect(isStorageObjectPath('patient-uuid/sample-uuid/file.pdf')).toBe(true);
  });

  it('routes downloads through the signed-url API', () => {
    expect(reportDownloadHref('abc')).toBe('/api/reports/abc/file');
  });
});
