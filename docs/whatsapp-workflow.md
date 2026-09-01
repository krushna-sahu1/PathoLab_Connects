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
1. Twilio sends inbound webhook to `/api/whatsapp`
2. `whatsappService.handleIncomingMessage` processes it
3. Patient is identified or created by phone number
4. Menu state is maintained in `whatsapp_conversations`
5. Actions are dispatched to appropriate services

## Credentials
Never hard-coded. Use environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
