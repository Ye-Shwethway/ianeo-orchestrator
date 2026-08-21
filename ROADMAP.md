# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle.

## Locked architecture

IANEO is a separate TypeScript Cloudflare Worker and personal Telegram command center over independent services.

Runtime:

`Telegram -> IANEO Worker -> adapter -> direct HTTPS/API -> target service`

Production delivery:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Manual deploy is recovery-only. A merge is not complete until the resulting production deploy is checked.

Stable endpoints:

- IANEO: `https://ianeo.drthorne.uk`
- School of Nursing FAQ: `https://faq.drthorne.uk`

Existing workers.dev endpoints remain enabled as fallback/debug surfaces.

## Telegram UX architecture

Canonical hierarchy:

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

A separate `System` layer remains at the root.

Current hierarchy:

- `🤖 Bots`
  - `🎓 School of Nursing FAQ`
    - `🩺 Health`
  - future Outline Manager
  - future URL Uploader
  - future Observer Sandbox
- `⚙️ System`
  - `📊 Status`

Bot-specific actions are surfaced only when the adapter/backend actually supports them.

Menu-card behavior:

- navigation edits the same card in place;
- every menu layer has `✕ Close` for manual deletion;
- leaf actions auto-close the menu card after sending the result;
- no timer/scheduler/state store is introduced solely for menu expiry.

## v0.1 — Production foundation

Completed:

- [x] TypeScript Cloudflare Worker foundation
- [x] Telegram webhook-secret verification
- [x] owner-only access
- [x] adapter registry/contract
- [x] FAQ direct HTTPS health adapter
- [x] `FAQ_SERVICE_URL = https://faq.drthorne.uk`
- [x] Cloudflare runtime values configured
- [x] `ianeo.drthorne.uk` attached and `/health` live-verified
- [x] workers.dev `/health` remains live
- [x] Telegram webhook registered
- [x] owner `/start` live-verified
- [x] Node 22 CI/deploy hotfix merged
- [x] permanent merge-to-main auto-deploy rule

## v0.2 — Layered Bots menu

PR #4 merged and user live-tested successfully.

Completed:

- [x] callback-query support
- [x] reusable inline-keyboard helpers
- [x] `/menu` and `/bots`
- [x] root `🤖 Bots` and `⚙️ System`
- [x] adapter-driven Bots list
- [x] FAQ submenu
- [x] FAQ health action
- [x] System status action
- [x] edit-in-place navigation/back buttons
- [x] production deployment and user live test

Current follow-up branch: `feat/menu-close-and-faq-bridge`

- [x] `✕ Close` on all menu layers
- [x] reusable Telegram message deletion helper
- [x] action-completion auto-close for FAQ Health and System Status
- [ ] targeted CI
- [ ] merge main
- [ ] automatic production deploy verification
- [ ] live Telegram close/auto-close verification

## FAQ control expansion

FAQ repository reconnaissance confirms substantial owner/admin/monitoring/handoff logic, including Telegram-native `/admin`, `/admins`, `/sudo`, monitoring, handoff and AI controls. These are internal Telegram/runtime paths, not a remote HTTP control API.

IANEO must not control the FAQ bot by forwarding Telegram commands.

Next integration slice after menu-close verification:

1. add the smallest authenticated `/internal/v1/...` bridge to the FAQ Worker;
2. use a dedicated service credential shared only between IANEO and FAQ;
3. start with useful read-only operational summaries;
4. classify future actions as read/write/sensitive;
5. require explicit confirmation for sensitive actions;
6. expose only proven capabilities in the FAQ submenu.

First bridge candidates: runtime/admin summary, monitoring status, handoff status and basic stats. Role-changing/destructive actions come later.

## Deferred integrations

Observer Sandbox currently has local Python/SQLite/CLI control but no remote HTTP surface; it requires a separately authorized minimal bridge. Outline Manager and URL Uploader remain future adapter slices.
