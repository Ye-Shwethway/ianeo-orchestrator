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

## Permanent production-delivery rule

Normal production work uses:

`branch -> PR -> targeted CI green -> merge to main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Every main merge must automatically trigger the production deployment workflow. Manual deployment is recovery/exception only. Never confuse CI green with production-deploy green; inspect the deployment result after merge.

## Current repository state

- PR #1 — `Bootstrap IANEO Orchestrator v0.1 foundation` — merged to `main`.
- First production deploy failed because Wrangler `^4.124.0` requires Node.js `>=22.0.0`, while the workflow used Node `20.20.2`.
- PR #2 — `Fix Wrangler deployment runtime to Node 22` — passed CI and merged to `main`.
- CI and Deploy Production now use Node 22.
- `package.json` declares `engines.node >=22`.
- `Deploy Production` is configured to run on every push to `main` and also supports manual dispatch.

## Current implementation

Main contains:

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

## Cloudflare/runtime checkpoint — 2026-08-21

User-reported operational state:

- Node 22 hotfix is merged.
- A manual production deployment completed successfully after the hotfix.
- `ianeo-orchestrator` is therefore treated as deployed from user-reported operational evidence, but public endpoint health still needs explicit verification.
- `TELEGRAM_BOT_TOKEN` has been entered as a Cloudflare Worker secret.
- `TELEGRAM_WEBHOOK_SECRET` has been entered as a Cloudflare Worker secret.
- `TELEGRAM_OWNER_ID` has been entered as a Cloudflare plaintext variable.
- `FAQ_SERVICE_URL` remains repo/Wrangler-managed as `https://faq.drthorne.uk`.
- `ianeo.drthorne.uk` still needs to be attached and verified.
- Telegram webhook still needs to be registered and verified.

Existing FAQ-side verified state:

- production FAQ Worker: `school-of-nursing-faq-bot`
- `faq.drthorne.uk` attached as its Custom Domain
- original FAQ workers.dev URL still enabled
- `GET https://faq.drthorne.uk/health` returned HTTP 200 with `ok: true`, service `school-of-nursing-faq-bot`, environment `production`

Canonical FAQ path:

`IANEO Worker -> https://faq.drthorne.uk -> school-of-nursing-faq-bot`

## Secrets/config boundary

GitHub Actions deployment secrets, configured by the user:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Worker runtime secrets, configured by the user:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

Cloudflare plaintext runtime variable, configured by the user:

- `TELEGRAM_OWNER_ID`

Repo-managed non-secret variable:

- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

Never place real secret values in repository source or chat-visible docs.

## First-adapter state

School of Nursing FAQ Bot is the first adapter. It uses the existing public read-only `GET /health`; no FAQ repository changes were needed.

Observer Sandbox reconnaissance found local Python/SQLite/CLI control but no remote HTTP surface. Observer integration remains deferred until a separately authorized minimal authenticated bridge.

## Production state

**Worker deployed; end-to-end live verification pending.**

Do not yet claim Telegram production success. The remaining proof boundary is:

1. IANEO `/health` responds successfully on the deployed hostname.
2. `ianeo.drthorne.uk` is attached and `/health` succeeds there.
3. Telegram webhook is registered using the configured webhook secret.
4. `/start` works for the owner.
5. `/status` successfully reports IANEO plus FAQ health through the direct HTTPS adapter.

## Next authorized slice

1. verify deployed IANEO `/health`;
2. attach `ianeo.drthorne.uk` to `ianeo-orchestrator`;
3. live-verify `GET https://ianeo.drthorne.uk/health`;
4. register Telegram webhook at `https://ianeo.drthorne.uk/telegram/webhook` using the configured secret token;
5. verify webhook registration;
6. test owner-only `/start` and `/status`;
7. verify FAQ health through IANEO;
8. confirm next main merge auto-deploys without manual intervention;
9. reconcile continuity docs from verified live evidence.

## One-line handoff

Current truth: PR #1 and the Node 22 deployment hotfix PR #2 are merged; IANEO has been manually deployed successfully and its Telegram runtime bindings are configured; merge-to-main auto-deploy is now a permanent project invariant; the next work is stable-domain, webhook, and end-to-end live verification.
