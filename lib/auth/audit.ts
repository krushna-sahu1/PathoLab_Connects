import { createAdminClient } from '@/lib/supabase/admin';

interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Write an audit log entry.
 * Use for important administrative actions.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      user_id: entry.user_id ?? null,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id ?? null,
      old_values: entry.old_values ?? null,
      new_values: entry.new_values ?? null,
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
    });
  } catch (err) {
    // Audit log failure should never crash the main flow
    console.error('[AuditLog] Failed to write:', err);
  }
}
