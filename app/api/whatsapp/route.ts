import { NextResponse } from 'next/server';
import { whatsappService } from '@/services/whatsapp.service';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let from = '';
    let body = '';

    if (contentType.includes('application/json')) {
      const json = (await request.json()) as { from?: string; body?: string; From?: string; Body?: string };
      from = json.from ?? json.From ?? '';
      body = json.body ?? json.Body ?? '';
    } else {
      const form = await request.formData();
      from = String(form.get('From') ?? form.get('from') ?? '');
      body = String(form.get('Body') ?? form.get('body') ?? '');
    }

    if (!from || !body) {
      return NextResponse.json({ error: 'from and body are required' }, { status: 400 });
    }

    const result = await whatsappService.handleIncomingMessage(from, body);

    if (contentType.includes('application/json')) {
      return NextResponse.json(result);
    }

    // Twilio expects TwiML. The reply was already sent via the provider.
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
