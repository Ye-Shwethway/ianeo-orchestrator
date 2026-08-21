# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Mandatory reconciliation order

1. `AGENTS.md`
2. `NEW_CHAT_BOOTSTRAP.md`
3. `ROADMAP.md`
4. task-relevant source/docs

Verified runtime evidence wins over repository narrative; repository state wins over remembered chat context.

## Permanent rules

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` must be updated after every meaningful implementation/integration/deployment/operational change.

Normal production delivery is:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Manual deployment is recovery-only. Check production deploy separately from CI.

## Current live platform state — 2026-08-21

Cloudflare-side verified/reported state:

- IANEO Worker: `ianeo-orchestrator`
- canonical public URL: `https://ianeo.drthorne.uk`
- `GET https://ianeo.drthorne.uk/health` -> HTTP 200, `ok: true`, service `ianeo-orchestrator`, version `0.1.0`, adapters includes `faq`
- production workers.dev `/health` also returns HTTP 200
- production and preview workers.dev exposure remain enabled
- FAQ canonical URL: `https://faq.drthorne.uk`
- FAQ `/health` was live-verified production healthy
- Telegram runtime values are configured in Cloudflare
- Telegram webhook has been registered by the user
- owner `/start` has been live-verified and returns the IANEO welcome response
- owner `/status` FAQ-through-IANEO live verification is still pending

## Current repository state

Merged:

- PR #1 — v0.1 foundation
- PR #2 — Node 22 Wrangler deployment hotfix
- PR #3 — live deployment checkpoint + permanent auto-deploy rule

Current development branch:

`feat/bots-menu-foundation`

## Current implementation on main

- owner-only Telegram webhook
- `/start`
- `/status`
- adapter registry/contract
- `FaqAdapter`
- direct HTTPS FAQ health
- `workers_dev = true`
- `keep_vars = true`
- `FAQ_SERVICE_URL = https://faq.drthorne.uk`
- GitHub Actions CI + automatic main-branch production deployment using Node 22

## Active slice — layered Bots menu

User explicitly requires a dedicated bot-list layer because IANEO will integrate multiple bots/services.

Canonical Telegram hierarchy:

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

A separate `System` layer remains at the root.

Branch implementation currently adds:

- callback-query support
- inline keyboard send/edit/callback helpers
- `/menu`
- `/bots`
- root buttons: `🤖 Bots`, `⚙️ System`
- Bots list generated from configured adapters
- `🎓 School of Nursing FAQ` submenu
- FAQ `🩺 Health` action
- System `📊 Status` action
- edit-in-place navigation/back buttons

Do not show controls that the backend does not support.

## FAQ control reconnaissance

FAQ repository inspection confirms substantial Telegram-native management logic already exists, including owner/Sudo Admin handling and commands such as `/admin`, `/admins`, `/sudo`, plus monitoring/handoff systems.

However these are internal Telegram/runtime control paths, not a remote HTTP API. IANEO must not use Telegram bot-to-bot command forwarding.

After the Bots menu foundation is live, the next FAQ slice should expose the smallest authenticated remote `/internal/v1/...` bridge needed for useful operational control. Prefer read-only status/monitoring/handoff/stat summaries first. Use a dedicated service token. Sensitive actions require confirmation.

## Secrets/config boundary

GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Worker runtime secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- future service-specific tokens

Cloudflare plain variable:

- `TELEGRAM_OWNER_ID`

Repo-managed variable:

- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

Never commit real secret values.

## Next actions

1. run targeted CI on `feat/bots-menu-foundation`;
2. merge only if green;
3. verify automatic main-branch Deploy Production succeeds without manual deploy;
4. live-test `/start` -> `🤖 Bots` -> FAQ -> `🩺 Health` and back navigation;
5. live-test System -> Status and verify FAQ healthy;
6. reconcile continuity docs from the deployed evidence;
7. then design the minimum authenticated FAQ control bridge.

## One-line handoff

Current truth: IANEO is live at `ianeo.drthorne.uk`, Telegram `/start` works, FAQ health is connected, and the active slice is a dedicated layered Bots menu that will become the scalable navigation foundation for all future bot/service integrations; richer FAQ control still needs a minimal authenticated remote bridge.
