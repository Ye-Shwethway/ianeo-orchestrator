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

Current stable endpoints:

- IANEO: `https://ianeo.drthorne.uk`
- School of Nursing FAQ: `https://faq.drthorne.uk`

Existing workers.dev endpoints remain enabled as fallback/debug surfaces.

## Telegram UX architecture

IANEO uses a layered navigation model so additional bots do not crowd the root UI:

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

Root menu also keeps a separate System layer.

Current planned/implemented hierarchy:

- `🤖 Bots`
  - `🎓 School of Nursing FAQ`
    - `🩺 Health`
  - future Outline Manager
  - future URL Uploader
  - future Observer Sandbox
- `⚙️ System`
  - `📊 Status`

Bot-specific actions are surfaced only when the adapter/backend actually supports them. Do not present fake controls.

## v0.1 production foundation

Completed:

- [x] TypeScript Cloudflare Worker foundation
- [x] Telegram webhook secret verification
- [x] owner-only access
- [x] `/start` and `/status`
- [x] adapter registry/contract
- [x] first `FaqAdapter` health read path
- [x] `FAQ_SERVICE_URL = https://faq.drthorne.uk`
- [x] Cloudflare runtime credentials configured by user
- [x] `ianeo.drthorne.uk` attached and live `/health` verified
- [x] workers.dev `/health` remains live
- [x] Telegram webhook registered by user
- [x] owner `/start` live-verified
- [x] Node 22 CI/deploy hotfix merged
- [x] merge-to-main auto-deploy rule locked in `AGENTS.md`

Still pending v0.1 proof:

- [ ] owner `/status` live verification showing FAQ healthy
- [ ] verify the next merged production change auto-deploys without manual intervention

## v0.2 — Layered Bots menu foundation

Current branch: `feat/bots-menu-foundation`

Scope:

- [x] Telegram callback-query support
- [x] reusable inline-keyboard send/edit/callback helpers
- [x] root `🤖 Bots` and `⚙️ System` layers
- [x] `/bots` and `/menu`
- [x] configured adapters populate the Bots list
- [x] FAQ submenu
- [x] FAQ health action through the existing adapter
- [x] edit-in-place navigation to reduce chat clutter
- [ ] targeted CI
- [ ] merge to main
- [ ] automatic production deploy verification
- [ ] live Telegram menu verification

## FAQ control expansion

Repository reconnaissance confirms the FAQ bot already contains substantial owner/admin/monitoring/handoff logic, including Telegram-native `/admin`, `/admins`, and `/sudo` handling. Those controls are internal Telegram/runtime functions, not a remote HTTP control API.

Therefore IANEO must **not** control the FAQ bot by sending Telegram commands to it.

Next FAQ integration slice after menu foundation:

1. identify the smallest useful remote read/control actions;
2. expose a tiny authenticated `/internal/v1/...` bridge in the FAQ Worker only where needed;
3. use a dedicated service credential;
4. classify actions as read/write/sensitive;
5. require confirmation for sensitive actions;
6. add only proven capabilities to the FAQ submenu.

Likely first useful bridge candidates are read-only operational summaries such as admin/runtime status, handoff/monitoring status, and basic stats. Destructive or role-changing actions come later.

## Deferred integrations

Observer Sandbox currently has local Python/SQLite/CLI control but no remote HTTP surface; it requires a separately authorized minimal bridge. Outline Manager and URL Uploader remain future adapter slices.
