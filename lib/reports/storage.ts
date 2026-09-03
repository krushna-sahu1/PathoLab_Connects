export const REPORTS_BUCKET = 'reports';
export const SIGNED_URL_TTL_SECONDS = 15 * 60;

export function isStorageObjectPath(filePath: string | null | undefined): boolean {
  if (!filePath) return false;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return false;
  return filePath.includes('/');
}

export function reportDownloadHref(reportId: string): string {
  return `/api/reports/${reportId}/file`;
}
