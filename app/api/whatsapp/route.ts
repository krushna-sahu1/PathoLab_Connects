import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp.service';
import { twilioWebhookUrl, verifyTwilioSignature } from '@/lib/twilio/validate';

function formToParams(form: FormData): Record<string, string> {
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === 'string') params[key] = value;
  });
  return params;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let from = '';
    let body = '';

    if (contentType.includes('application/json')) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'JSON inbound is disabled in production' }, { status: 403 });
      }
      const supabase = await (await import('@/lib/supabase/server')).createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const json = (await request.json()) as { from?: string; body?: string; From?: string; Body?: string };
      from = json.from ?? json.From ?? '';
      body = json.body ?? json.Body ?? '';
    } else {
      const form = await request.formData();
      const params = formToParams(form);
      const signature = request.headers.get('X-Twilio-Signature');
      const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
      const url = twilioWebhookUrl();

      if (!verifyTwilioSignature(authToken, signature, url, params)) {
        return NextResponse.json({ error: 'Invalid Twilio signature' }, { status: 403 });
      }

      from = params.From ?? params.from ?? '';
      body = params.Body ?? params.body ?? '';
    }

    if (!from || !body) {
      return NextResponse.json({ error: 'from and body are required' }, { status: 400 });
    }

    const result = await whatsappService.handleIncomingMessage(from, body);

    if (contentType.includes('application/json')) {
      return NextResponse.json(result);
    }

    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err) {
    console.error('[whatsapp webhook]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    );
  }
}
