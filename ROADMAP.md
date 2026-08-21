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

Current:
- `🤖 Bots`
  - `🎓 School of Nursing FAQ`
    - `🩺 Health`
    - `📊 Operations`
- `⚙️ System`
  - `📊 Status`

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
- [x] PR #5 menu manual/action-completion close implementation merged

## FAQ operational bridge — current slice

FAQ repository main now contains a minimal protected endpoint:

`GET https://faq.drthorne.uk/internal/v1/status`

FAQ-side auth secret: `IANEO_SERVICE_TOKEN`.

IANEO-side matching secret: `FAQ_SERVICE_TOKEN`.

The endpoint is read-only and aggregate-only. It returns:
- environment
- monitoring mode
- handoff route + Staff Inbox configured boolean
- users/questions/pending questions
- active cases/staff
- Sudo Admin count
- human-controlled conversation count

It does not return Telegram IDs, names, chat IDs, question bodies, or other private records.

IANEO branch `feat/faq-operations-read` adds:
- `FAQ_SERVICE_TOKEN` Env binding;
- Bearer-authenticated FAQ operations fetch;
- `operations` read capability;
- `📊 Operations` FAQ submenu action;
- compact Telegram operational summary;
- local example binding.

Pending:
- [ ] targeted IANEO CI
- [ ] merge + automatic deployment
- [ ] configure the same dedicated secret value in FAQ Worker as `IANEO_SERVICE_TOKEN`
- [ ] configure it in IANEO Worker as `FAQ_SERVICE_TOKEN`
- [ ] verify wrong/missing bearer is blocked
- [ ] live-test Telegram FAQ Operations
- [ ] verify menu close/auto-close production behavior

## Safety boundary

FAQ control must never use Telegram bot-to-bot command forwarding. Read operations are allowed through the dedicated authenticated HTTP bridge. Future write/sensitive actions must be added one at a time and require explicit confirmation where appropriate.

## Deferred integrations

Observer Sandbox needs a separate minimal remote bridge. Outline Manager and URL Uploader remain future adapter slices.
