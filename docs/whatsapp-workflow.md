# WhatsApp Workflow

## Provider Abstraction
- Development: `MockWhatsAppProvider`
- Production: `TwilioWhatsAppProvider`
- Business logic never depends on Twilio directly.

## Main Menu
```
1. Book Sample Collection
2. Track My Collection
3. Track My Sample
4. Get My Report
5. Raise a Query
6. Talk to Support
```

## Inbound Flow
1. Twilio posts signed form data to `/api/whatsapp`
2. Signature is verified with `TWILIO_AUTH_TOKEN` against `TWILIO_WEBHOOK_URL`
3. `whatsappService.handleIncomingMessage` processes the menu
4. Patient is identified or created by phone number

JSON inbound (dashboard simulator) is **development-only** and requires a signed-in staff user.

## Outbound notifications
Status events send WhatsApp from `notificationService` using the Twilio provider in production.

## Credentials (never committed)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER` (e.g. `whatsapp:+91…`)
- `TWILIO_WEBHOOK_URL` (must match the Twilio console callback URL exactly)
- `NEXT_PUBLIC_APP_URL`
