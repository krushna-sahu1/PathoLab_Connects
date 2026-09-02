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
1. Twilio (or the mock JSON client) posts to `/api/whatsapp`
2. `whatsappService.handleIncomingMessage` processes it
3. Patient is identified or created by phone number
4. Menu state is stored on `whatsapp_conversations.menu_state`
5. Actions call collection / sample / ticket services directly

## Outbound notifications
Status events (collection assigned / on the way / collected / failed, report ready, ticket created) send WhatsApp messages from `notificationService` in the Next.js app. n8n is not used for V1.

## Credentials
Never hard-coded. Use environment variables:
- `WHATSAPP_PROVIDER` (`mock` or `twilio`)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
