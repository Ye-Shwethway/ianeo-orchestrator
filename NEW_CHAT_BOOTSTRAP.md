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
- layered Bots menu deployed and user-tested
- `✕ Close` + action-completion auto-close implemented/merged
- authenticated FAQ Operational Summary is live and working
- matching FAQ/IANEO service secrets are attached to active production versions at 100% traffic after a Cloudflare version mismatch was fixed

## Scalable FAQ control architecture

The FAQ bot has many Telegram Owner commands (schema revision 11; Owner 19), but IANEO will **not** implement one endpoint and one Telegram handler per command.

FAQ service now has a capability registry:
- `GET /internal/v1/capabilities`
- `GET /internal/v1/status` (backwards compatible)
- `POST /internal/v1/actions/<action-id>`

Current FAQ remote-safe read actions:
- `operations.status`
- `monitoring.status`
- `handoff.status`
- `admins.summary`
- `cases.summary`

Every capability declares safety (`read` / `write` / `sensitive`) and whether confirmation is required.

Telegram Owner commands and IANEO capabilities are separate interfaces over shared domain functions. Do not forward command strings bot-to-bot. A future remote action is added by registering the underlying domain operation once in the FAQ capability registry.

## Active IANEO branch

`feat/dynamic-faq-capabilities`

It adds:
- extended adapter capability metadata (`label`, `requiresConfirmation`);
- `FaqAdapter.getCapabilities()` authenticated discovery from FAQ;
- generic `POST /internal/v1/actions/<action-id>` execution;
- fallback compatibility for the original Operational Summary;
- FAQ submenu generated from discovered capabilities instead of hard-coded buttons;
- generic data rendering for read-action results;
- generic confirmation card path for future write/sensitive capabilities.

Important safety boundary: IANEO confirmation UI does not itself grant authority. The FAQ service currently executes read actions only; target-side authorization/audit remains authoritative when writes are later enabled.

## Secrets/config boundary

GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

IANEO Worker secrets:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `FAQ_SERVICE_TOKEN`

FAQ Worker secret:
- `IANEO_SERVICE_TOKEN`

IANEO plaintext variable:
- `TELEGRAM_OWNER_ID`

Repo-managed:
- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

The two service-token bindings contain the same dedicated credential but use service-specific binding names. Never commit or expose the value.

## Current validation boundary

FAQ:
1. capability-registry production workflow green;
2. authenticated capabilities manifest returns five reads;
3. generic read dispatch works and unknown actions fail closed;
4. existing Telegram/health/scheduled behavior unchanged.

IANEO:
1. targeted CI on `feat/dynamic-faq-capabilities`;
2. PR merge only if green;
3. automatic production deploy verification;
4. Telegram FAQ submenu dynamically shows Health plus discovered FAQ reads;
5. Operational Summary still works;
6. Monitoring Status, Handoff Status, Admin Summary, Cases Summary work;
7. Close/auto-close behavior remains correct.

## Next control expansion

After this slice is live, add selected bounded write actions into the same FAQ registry. Best first candidates are monitoring-mode and handoff-route changes because existing domain functions already encapsulate them.

Sensitive Owner functions (Sudo role changes, AI credentials/config, message clearing, destructive actions) remain deferred until explicit confirmation plus target-side audit/authorization semantics are implemented.

## One-line handoff

Current truth: IANEO and FAQ are live and authenticated; FAQ Operational Summary works; the active slice replaces hard-coded FAQ controls with capability discovery + generic action dispatch, so future Owner-control expansion does not require one bespoke endpoint/IANEO handler per Telegram command.
