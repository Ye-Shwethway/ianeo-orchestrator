# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both files in the same work cycle.

## Locked architecture

IANEO is a separate TypeScript Cloudflare Worker and personal Telegram command center over independent services.

Runtime:

`Telegram -> IANEO Worker -> adapter -> direct HTTPS/API -> target service`

Production delivery:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Stable endpoints:
- IANEO: `https://ianeo.drthorne.uk`
- FAQ: `https://faq.drthorne.uk`

## Telegram UX

Hierarchy:

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

The Bots layer is adapter-driven and service submenus are capability-driven where a manifest exists.

Menu-card contract:
- navigation edits the same card in place;
- every menu/result layer has `✕ Close`;
- leaf results stay open and expose `⬅️ Back` + `✕ Close`;
- cards auto-delete after about 5 minutes of inactivity;
- every interaction resets the inactivity window;
- manual Close deletes immediately and cancels scheduled cleanup.

Five-minute cleanup uses one minimal `MenuCleanup` Durable Object alarm class because post-response `waitUntil()` cannot reliably hold a five-minute timer.

## Production foundation

Completed:
- [x] Worker + Telegram webhook + owner-only access
- [x] direct HTTPS adapter model
- [x] FAQ health path
- [x] `ianeo.drthorne.uk` + `faq.drthorne.uk`
- [x] Node 22 CI/deploy
- [x] main merge auto-deploy rule
- [x] layered Bots menu live
- [x] authenticated FAQ Operational Summary live
- [x] capability-driven FAQ read controls live through `cases.summary`
- [x] PR #8 result Back/Close + five-minute inactivity cleanup merged after green CI

## FAQ capability-control architecture

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

Current bounded writes exposed by FAQ:
- `monitoring.set`
- `handoff.set`

Capability metadata supports:
- id / label / description
- safety: `read`, `write`, `sensitive`
- confirmation requirement
- optional reusable `choice` input: name, label, choices

IANEO does not implement one UI handler per FAQ Owner command. Generic choice-input rendering and generic action dispatch are the scalable path. Telegram commands and remote capabilities remain separate interfaces over shared domain functions.

## Active slice — generic choice writes

Branch: `feat/generic-choice-writes`

Implemented:
- [x] generic `CapabilityInput` / `CapabilityChoice` metadata
- [x] FAQ adapter imports remote choice metadata
- [x] generic choice picker card
- [x] generic selected-value confirmation card
- [x] generic params + explicit confirmation POST to FAQ
- [x] result returns to standard Back + Close card
- [x] five-minute inactivity timer continues/reset through choice and confirmation steps
- [x] Wrangler declares required Worker secrets so future deploys fail clearly if critical secrets are absent rather than silently publishing an unusable version

First write flows:
- Monitoring mode: All alerts / Silent all / Alerts only / Off
- Handoff route: Auto / Staff Inbox group / Dedicated staff

Target FAQ Worker remains authoritative for validation and persistence. Handoff group/dedicated choices fail closed when their destination is not configured.

Pending:
- [ ] targeted CI
- [ ] merge only if green
- [ ] automatic production deploy verification
- [ ] live monitoring mode change + restore
- [ ] live handoff route change + restore
- [ ] verify read actions and Back/Close/TTL remain intact

## Sensitive-control boundary

Sudo role changes, AI credential/config changes, message clearing and other destructive/privileged actions remain deferred. They require stronger target-side audit semantics and explicit confirmation before registry exposure.

## Deferred integrations

Observer Sandbox needs a separate minimal remote bridge. Outline Manager and URL Uploader remain future adapter slices.
