# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle.

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

The Bots layer is adapter-driven. A service-specific submenu should be capability-driven whenever the target service exposes a manifest.

Navigation edits one menu card in place. Every layer has `✕ Close`. Leaf actions send their result and auto-delete the menu card. No timer/scheduler/database exists solely for menu expiry.

## Production foundation

Completed:
- [x] Worker + Telegram webhook + owner-only access
- [x] direct HTTPS adapter model
- [x] FAQ health path
- [x] `ianeo.drthorne.uk` + `faq.drthorne.uk`
- [x] runtime secrets/config
- [x] Node 22 CI/deploy
- [x] main merge auto-deploy rule
- [x] layered Bots menu deployed and user-tested
- [x] manual `✕ Close` + action-completion auto-close merged
- [x] authenticated FAQ Operational Summary live-tested
- [x] FAQ/IANEO service secrets confirmed attached to active 100% production versions after Cloudflare version mismatch repair

## FAQ capability-control architecture — active slice

The FAQ service now exposes a generic authenticated control plane instead of requiring one endpoint per Telegram Owner command:

- `GET /internal/v1/capabilities`
- `GET /internal/v1/status` for backwards compatibility
- `POST /internal/v1/actions/<action-id>`

Current FAQ read capabilities:
- `operations.status`
- `monitoring.status`
- `handoff.status`
- `admins.summary`
- `cases.summary`

Each remote capability carries:
- id
- label/description
- safety: `read`, `write`, or `sensitive`
- `requiresConfirmation`

IANEO branch `feat/dynamic-faq-capabilities` changes `FaqAdapter.getCapabilities()` to discover that manifest over authenticated HTTPS. The Telegram FAQ submenu is then built from the discovered capabilities rather than hard-coded buttons.

Action execution is generic: IANEO posts to `/internal/v1/actions/<action-id>`. The first static `operations` action remains backwards-compatible by mapping to `operations.status`.

Generic UX safety is already prepared:
- read actions execute directly;
- write/sensitive/confirmation-required actions route to a confirmation card before execution;
- target-service server-side enforcement remains authoritative;
- the FAQ service currently enables read actions only, so confirmation UX does not yet grant write authority by itself.

This avoids implementing 19 separate HTTP endpoints and 19 separate IANEO handlers for the FAQ Owner command set. Telegram commands and remote capabilities are separate interfaces over shared domain functions. Only useful, remote-safe operations should be registered.

## Current validation boundary

FAQ side:
- production workflow for the capability-registry source changes must be green;
- authenticated `GET /internal/v1/capabilities` must return five read actions;
- generic read action dispatch must work;
- unknown actions must fail closed;
- existing Telegram/health/scheduled behavior must remain unchanged.

IANEO side:
- [ ] targeted CI on `feat/dynamic-faq-capabilities`
- [ ] PR merge only if green
- [ ] automatic production deploy verification
- [ ] live Telegram FAQ submenu shows discovered Health + five remote reads
- [ ] Monitoring Status works
- [ ] Handoff Status works
- [ ] Admin Summary works
- [ ] Cases Summary works
- [ ] Operational Summary remains compatible
- [ ] close/auto-close behavior remains correct

## Next control expansion

After dynamic discovery is live, selected write actions can be added to the FAQ registry without changing the generic routing architecture. Recommended next write candidates are monitoring mode and handoff route because their domain functions already exist and their state transitions are bounded.

Sensitive role-changing/destructive actions such as Sudo changes, AI credential/configuration changes, clearing messages, or other irreversible operations require explicit confirmation plus target-side audit/authorization semantics before registration.

## Deferred integrations

Observer Sandbox needs a separate minimal remote bridge. Outline Manager and URL Uploader remain future adapter slices.
