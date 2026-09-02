# WhatsApp Content Template drafts (not wired)

Session-based free-form replies stay the default until these are approved and you ask to switch outbound to template SIDs.

Use a named placeholder style Twilio Content accepts (`{{1}}`, `{{2}}`, …). Language: English (India). Category suggestion: **Utility**.

## 1. Collection assigned

**Name:** `collection_assigned`

An agent has been assigned for your Hypatho sample collection on {{1}} ({{2}}). Agent: {{3}}. Reply 2 to track your collection.

- {{1}} date (e.g. 12 Sep 2026)
- {{2}} time slot (e.g. 8:00–10:00 AM)
- {{3}} agent name

## 2. Agent on the way

**Name:** `collection_on_the_way`

Your Hypatho collection agent {{1}} is on the way. Please keep your ID ready.

- {{1}} agent name

## 3. Collected

**Name:** `collection_collected`

We have collected your sample ({{1}}). We will message you when the report is ready. Reply 3 to track the sample.

- {{1}} collection ID (e.g. COL-20260912-AB12)

## 4. Failed

**Name:** `collection_failed`

We could not complete your Hypatho sample collection. Reason: {{1}}. Reply 1 to book again, or 6 to talk to support.

- {{1}} short reason (patient unavailable, wrong address, etc.)

## 5. Report ready

**Name:** `report_ready`

Hi {{1}}, your Hypatho report for sample {{2}} is ready. Reply 4 for details. We will not send a public download link on WhatsApp.

- {{1}} patient first/full name
- {{2}} sample ID

---

Do not include guessable file URLs in templates. After approval, send template SIDs (not this wording in git as live config) to wire outbound.
