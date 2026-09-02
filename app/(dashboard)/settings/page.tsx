import { requireRole } from '@/lib/auth/session';
import { settingsService } from '@/services/settings.service';
import { SettingsForm } from '@/components/settings/settings-form';

export default async function SettingsPage() {
  await requireRole(['super_admin', 'operations_admin']);
  const settings = await settingsService.get();
  const whatsappReady = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER &&
      process.env.WHATSAPP_PROVIDER !== 'mock'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Organization configuration</p>
      </div>

      <SettingsForm settings={settings} />

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-xl space-y-2">
        <h3 className="font-semibold text-gray-900">Integrations</h3>
        <p className="text-sm text-gray-600">
          WhatsApp (Twilio):{' '}
          <span className={whatsappReady ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
            {whatsappReady ? 'Configured' : 'Not configured — add Twilio credentials on the host'}
          </span>
        </p>
        <p className="text-xs text-gray-400">
          Credentials are never stored in the database. n8n is not wired in this version.
        </p>
      </div>
    </div>
  );
}
