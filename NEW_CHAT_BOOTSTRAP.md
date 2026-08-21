# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Mandatory reconciliation order

1. `AGENTS.md`
2. `NEW_CHAT_BOOTSTRAP.md`
3. `ROADMAP.md`
4. task-relevant source/docs

When sources conflict, prefer verified live/runtime evidence, then current repository state, then continuity docs, then remembered chat context.

## Permanent continuity rule

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle.

## Project identity

IANEO Orchestrator is a separate TypeScript Cloudflare Worker acting as a lightweight personal Telegram command center over independent services.

Interactive runtime:

`Telegram -> webhook -> IANEO Worker -> adapter -> direct HTTPS/API -> target service`

Deployment:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

GitHub Actions are CI/deployment only. Telegram bot-to-bot messaging is not the integration bus.

## Current repository state

PR #1 — `Bootstrap IANEO Orchestrator v0.1 foundation` — is **merged to `main`**.

Current hotfix branch:

`fix/node22-deploy`

Reason: first production deploy failed because Wrangler `^4.124.0` requires Node.js `>=22.0.0`, while the deployment workflow used Node `20.20.2`.

Hotfix contents:

- production deployment workflow -> Node 22
- CI workflow -> Node 22
- `package.json` -> `engines.node >=22`
- continuity docs -> deployment failure/current state recorded

The failure occurred locally inside Wrangler before successful publication. Treat Cloudflare deployment credentials as **not yet verified by an actual deployment**, and treat `ianeo-orchestrator` as **not yet created/live-verified**.

## Current implementation

Main already contains:

- Worker name `ianeo-orchestrator`
- `GET /health`
- Telegram `POST /telegram/webhook`
- Telegram webhook-secret verification
- owner-only access via `TELEGRAM_OWNER_ID`
- `/start`
- `/status`
- adapter registry/contract
- `FaqAdapter`
- `/status` adapter health aggregation
- `workers_dev = true`
- `keep_vars = true`
- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

## Cloudflare readiness

Verified/reported Cloudflare-side state from 2026-08-21:

- production FAQ Worker: `school-of-nursing-faq-bot`
- `faq.drthorne.uk` attached as its Custom Domain
- original FAQ workers.dev URL still enabled
- `GET https://faq.drthorne.uk/health` returned HTTP 200 with `ok: true`, service `school-of-nursing-faq-bot`, environment `production`
- `ianeo.drthorne.uk` is unused/available but intentionally not attached until the IANEO Worker exists
- Telegram webhook not configured

Canonical FAQ path:

`IANEO Worker -> https://faq.drthorne.uk -> school-of-nursing-faq-bot`

## Secrets/config boundary

GitHub Actions deployment secrets, reported configured by the user:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Worker runtime secrets still pending after first successful deployment:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

Cloudflare plain runtime variable still pending:

- `TELEGRAM_OWNER_ID`

Repo-managed non-secret variable:

- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

Never place real secret values in repository source or chat-visible docs.

## First-adapter state

School of Nursing FAQ Bot is the first adapter. It uses the existing public read-only `GET /health`; no FAQ repository changes were needed.

Observer Sandbox reconnaissance found local Python/SQLite/CLI control but no remote HTTP surface. Observer integration remains deferred until a separately authorized minimal authenticated bridge.

## Production state

**Not live yet.**

Verified sequence so far:

1. PR #1 merged to `main`.
2. Main triggered `Deploy Production`.
3. Install and type-check reached the deploy step.
4. `npm run deploy` failed because Node 20.20.2 did not satisfy Wrangler's Node >=22 requirement.
5. No successful Worker publication has been verified.

## Next authorized slice

1. validate `fix/node22-deploy` under Node 22;
2. merge the hotfix to `main`;
3. observe the triggered production deployment;
4. confirm Worker creation and initial workers.dev `/health`;
5. configure Telegram runtime secrets and `TELEGRAM_OWNER_ID`;
6. attach `ianeo.drthorne.uk`;
7. register Telegram webhook;
8. verify owner-only `/start`, `/status`, and FAQ health end to end;
9. reconcile continuity docs from live evidence.

## One-line handoff

Current truth: PR #1 is merged; the first production deployment failed only because the GitHub Actions deploy job used Node 20 while Wrangler requires Node 22; `fix/node22-deploy` is the active targeted hotfix, and IANEO remains undeployed/unverified until that hotfix produces a successful Cloudflare deployment.
