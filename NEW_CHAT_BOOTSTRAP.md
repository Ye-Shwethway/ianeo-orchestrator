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

## Current live platform state — 2026-08-21

- IANEO: `https://ianeo.drthorne.uk`
- FAQ: `https://faq.drthorne.uk`
- both `/health` paths live-verified
- Telegram webhook registered
- owner `/start` live
- layered Bots menu from PR #4 deployed and user-tested
- PR #5 menu close behavior merged; production verification pending

## Telegram UX

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

Current target menu:
- `🤖 Bots`
  - `🎓 School of Nursing FAQ`
    - `🩺 Health`
    - `📊 Operations`
- `⚙️ System`
  - `📊 Status`

Every menu layer has `✕ Close`. Navigation edits in place; leaf actions send a result and auto-delete the menu card. No timer/scheduler/storage exists only for menu expiry.

## FAQ remote control bridge

FAQ main now implements protected read-only:

`GET https://faq.drthorne.uk/internal/v1/status`

FAQ Worker secret: `IANEO_SERVICE_TOKEN`.
IANEO matching secret: `FAQ_SERVICE_TOKEN`.

The bridge returns aggregate operational state only: environment, monitoring mode, handoff route/configured boolean, users/questions/pending questions, active cases/staff, Sudo Admin count, and human-controlled conversation count. It does not expose Telegram identities, chat IDs, question bodies, or other private records.

Current IANEO branch:

`feat/faq-operations-read`

Implementation includes:
- `FAQ_SERVICE_TOKEN` Env binding
- Bearer-authenticated `FaqAdapter` operations fetch
- `operations` read capability
- `📊 Operations` FAQ submenu button
- compact Telegram operational summary
- local example binding

## Secrets/config boundary

GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

IANEO Worker secrets:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `FAQ_SERVICE_TOKEN` (new, pending configuration)

FAQ Worker secret:
- `IANEO_SERVICE_TOKEN` (new, pending configuration)

IANEO plaintext variable:
- `TELEGRAM_OWNER_ID`

Repo-managed:
- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

The two service-token bindings must contain the same dedicated secret value. Never commit or expose the value in source/docs.

## Next actions

1. targeted CI for `feat/faq-operations-read`;
2. merge if green and verify automatic IANEO deployment;
3. configure matching service-token secret on both Cloudflare Workers;
4. verify FAQ endpoint blocks missing/wrong bearer and accepts correct bearer;
5. live-test `/start -> Bots -> School of Nursing FAQ -> Operations`;
6. verify manual `✕ Close` and leaf-action auto-close;
7. reconcile docs from live evidence;
8. only then design later write/sensitive FAQ controls with confirmation.

## One-line handoff

Current truth: IANEO is live with layered Bots navigation; menu-close UX is merged; FAQ now has a minimal dedicated-token read-only `/internal/v1/status` bridge; IANEO branch `feat/faq-operations-read` is wiring that bridge into the FAQ submenu, pending CI, deployment, matching Cloudflare secrets, and live verification.
