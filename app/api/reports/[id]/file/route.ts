import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { sampleService } from '@/services/sample.service';
import { createAdminClient } from '@/lib/supabase/admin';
import { isStorageObjectPath, REPORTS_BUCKET, SIGNED_URL_TTL_SECONDS } from '@/lib/reports/storage';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!hasPermission(user.role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  let report: { file_path?: string | null };
  try {
    report = await sampleService.getReportById(id);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!isStorageObjectPath(report.file_path)) {
    return NextResponse.json(
      { error: 'This report is not in private storage. Re-upload the PDF from the sample page.' },
      { status: 410 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(report.file_path!, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Could not create download link' }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
