# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Mandatory reconciliation order
1. `AGENTS.md`
2. `NEW_CHAT_BOOTSTRAP.md`
3. `ROADMAP.md`
4. task-relevant source/docs

Verified runtime evidence wins over repository narrative; repository state wins over remembered chat context.

## Permanent rules

Continuity docs update after every meaningful implementation/integration/deployment/operational change.

Normal production delivery:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Manual deployment is recovery-only. Production deploy green is separate from CI green.

## Current live state — 2026-08-21

- IANEO: `https://ianeo.drthorne.uk`
- FAQ: `https://faq.drthorne.uk`
- Telegram webhook live
- layered Bots navigation live
- FAQ capability discovery + generic reads live-tested through `cases.summary`
- matching service secrets active on both Workers
- PR #8 result-card Back/Close + five-minute inactivity cleanup merged after green CI; live verification of the new TTL UX is still pending

## Scalable FAQ control architecture

FAQ exposes:
- `GET /internal/v1/capabilities`
- `GET /internal/v1/status`
- `POST /internal/v1/actions/<action-id>`

Current reads:
- `operations.status`
- `monitoring.status`
- `handoff.status`
- `admins.summary`
- `cases.summary`

FAQ now also declares two bounded writes:
- `monitoring.set`
- `handoff.set`

The manifest supports reusable `choice` input metadata. This is the intended scale path for the many FAQ Owner commands: expose only remote-safe domain operations, not command strings, and let IANEO render generic input/confirmation UX from metadata.

## Active IANEO slice

Branch: `feat/generic-choice-writes`

Implemented:
- generic `CapabilityInput` / choice metadata;
- FAQ adapter validation/import of remote choice descriptors;
- generic choice-picker card;
- generic selected-value confirmation card;
- generic action params POST;
- reserved confirmation flag sent only after explicit Confirm;
- standard result Back + Close card after write;
- five-minute inactivity TTL continues through choice/confirmation/result views;
- Wrangler required-secret declarations for `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and `FAQ_SERVICE_TOKEN`, so future deploys fail clearly if critical secret bindings are absent.

First generic write flows:

### Monitoring mode
Choices:
- All alerts
- Silent all
- Alerts only
- Off

### Handoff route
Choices:
- Auto
- Staff Inbox group
- Dedicated staff

The FAQ Worker remains authoritative. It requires confirmation, validates values, rejects group route without Staff Inbox, rejects dedicated route without dedicated staff, persists through existing domain functions, and attributes mutations to the configured Bot Owner ID.

## Menu-card contract

- action result edits the same card;
- result keeps `⬅️ Back` + `✕ Close`;
- Close deletes immediately;
- card auto-deletes after about five minutes of inactivity;
- any navigation/action resets the inactivity timer;
- implementation uses one minimal `MenuCleanup` Durable Object alarm class, not a long `waitUntil()` timer.

## Validation boundary

Before merge:
1. targeted TypeScript CI green.

After merge/deploy:
1. automatic Deploy Production succeeds;
2. FAQ menu discovers the two new write actions;
3. Monitoring choice -> confirmation -> mutation -> result works;
4. read-back confirms selected mode, then restore original mode;
5. Handoff choice -> confirmation -> mutation works for valid configured route;
6. read-back confirms route, then restore original route;
7. Back/Close and five-minute TTL remain correct;
8. existing read actions remain unchanged.

## Sensitive-control boundary

Sudo role changes, AI credential/config changes, message clearing and destructive functions remain deferred until stronger target-side audit semantics are implemented and verified.

## One-line handoff

Current truth: dynamic FAQ reads are live; PR #8 merged the corrected Back/Close + five-minute inactivity menu lifecycle; FAQ now exposes the first two bounded write capabilities, and active IANEO work adds one generic choice-picker/confirmation execution path so future choice-based controls do not require bespoke UI code.
