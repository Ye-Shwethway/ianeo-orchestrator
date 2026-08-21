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

The Bots layer is adapter-driven. A service-specific submenu should be capability-driven whenever the target service exposes a manifest.

Menu-card contract:
- navigation edits the same card in place;
- every menu/result layer has `✕ Close`;
- leaf results stay open as the same card and expose `⬅️ Back` + `✕ Close`;
- menu/result cards auto-delete after about 5 minutes of inactivity;
- every navigation/action interaction resets that 5-minute inactivity window;
- manual Close cancels the scheduled cleanup and deletes immediately.

Reliable 5-minute cleanup uses one minimal `MenuCleanup` Durable Object class with alarms. `waitUntil()` is not used for the timer because Cloudflare only extends post-response execution for about 30 seconds.

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
- [x] authenticated FAQ Operational Summary live-tested
- [x] FAQ/IANEO service secrets attached to active production versions after Cloudflare version mismatch repair
- [x] capability-driven FAQ control discovery and generic read dispatch merged

## FAQ capability-control architecture

FAQ exposes:
- `GET /internal/v1/capabilities`
- `GET /internal/v1/status` for backwards compatibility
- `POST /internal/v1/actions/<action-id>`

Current FAQ read capabilities:
- `operations.status`
- `monitoring.status`
- `handoff.status`
- `admins.summary`
- `cases.summary`

Each remote capability carries id, label/description, safety (`read`, `write`, `sensitive`) and confirmation metadata. IANEO builds the FAQ submenu from this manifest instead of hard-coded command wrappers.

Telegram Owner commands and remote capabilities remain separate interfaces over shared domain functions. No Telegram bot-to-bot command forwarding.

## Active UX slice — result navigation + inactivity TTL

Branch: `feat/menu-result-back-ttl`

Implemented:
- [x] FAQ action results remain in the current card
- [x] System Status result remains in the current card
- [x] result cards expose `⬅️ Back` + `✕ Close`
- [x] reusable 5-minute inactivity cleanup scheduler
- [x] `MenuCleanup` Durable Object alarm resets on card interaction
- [x] `/start`, `/menu`, `/bots`, `/status` cards schedule cleanup from creation
- [x] manual Close cancels cleanup
- [x] Wrangler Durable Object binding + first migration

Pending:
- [ ] targeted CI
- [ ] merge only if green
- [ ] automatic Deploy Production verification
- [ ] live Telegram Back/Close verification
- [ ] live 5-minute inactivity auto-delete verification

## Next control expansion

After the UX slice is live, continue adding bounded write actions through the same capability registry. Best first write candidates remain monitoring mode and handoff route because their FAQ domain functions already exist and are bounded.

Sensitive role-changing/destructive actions such as Sudo changes, AI credential/config changes and message clearing require explicit confirmation plus target-side authorization/audit semantics before registration.

## Deferred integrations

Observer Sandbox needs a separate minimal remote bridge. Outline Manager and URL Uploader remain future adapter slices.
