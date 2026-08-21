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

Normal production delivery:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Manual deployment is recovery-only. Check production deploy separately from CI.

## Current live platform state — 2026-08-21

- IANEO Worker: `ianeo-orchestrator`
- canonical URL: `https://ianeo.drthorne.uk`
- IANEO `/health` live-verified HTTP 200 with `faq` adapter present
- production workers.dev `/health` also live
- FAQ canonical URL: `https://faq.drthorne.uk`
- FAQ production `/health` live-verified
- Telegram runtime values configured
- Telegram webhook registered
- owner `/start` works
- PR #4 layered Bots menu deployed and user-tested successfully
- main-merge automatic production deployment is the required normal path

## Current Telegram UX

Canonical hierarchy:

`IANEO Main Menu -> Bots -> Selected Bot -> Bot Actions`

Current menu:

- `🤖 Bots`
  - `🎓 School of Nursing FAQ`
    - `🩺 Health`
- `⚙️ System`
  - `📊 Status`

The Bots list is adapter-driven so future services can be added without crowding the root menu.

Current follow-up branch:

`feat/menu-close-and-faq-bridge`

It adds:

- `✕ Close` to every menu layer;
- Telegram `deleteMessage` helper;
- manual menu-card deletion;
- action-completion auto-close: leaf actions send their result and delete the menu card;
- no timer/scheduler/DB is introduced just to expire menus.

## FAQ control reconnaissance

The School of Nursing FAQ repository already has substantial Telegram-native owner/admin logic including `/admin`, `/admins`, `/sudo`, monitoring, handoff and AI-related controls.

Those are internal Telegram/runtime paths, not a remote HTTP control API. IANEO must never emulate control by sending Telegram commands to the FAQ bot.

After the close-UX slice is live, create the smallest authenticated FAQ remote bridge under `/internal/v1/...`, using a dedicated per-service credential. Start read-only with operational summaries such as runtime/admin, monitoring, handoff and basic stats. Sensitive role-changing/destructive actions require a later confirmation-enabled slice.

## Secrets/config boundary

GitHub Actions deployment secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

IANEO Cloudflare runtime secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- future `FAQ_SERVICE_TOKEN`

IANEO plaintext variable:

- `TELEGRAM_OWNER_ID`

Repo-managed variable:

- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

Never commit real secret values.

## Next actions

1. targeted CI on `feat/menu-close-and-faq-bridge`;
2. merge if green;
3. verify automatic Deploy Production succeeds;
4. live-test `✕ Close` and action-completion auto-close;
5. then implement the minimum authenticated FAQ `/internal/v1/...` bridge;
6. configure the dedicated FAQ service token on both Workers without exposing it in source/chat;
7. extend `FaqAdapter` and FAQ submenu with the first proven read-only operational controls;
8. reconcile continuity docs from live evidence.

## One-line handoff

Current truth: IANEO is live at `ianeo.drthorne.uk`; layered Bots navigation is deployed and user-tested; the current branch adds stateless manual/action-completion menu closing, and the next integration step is a dedicated-token authenticated FAQ remote control bridge starting with read-only operations.
