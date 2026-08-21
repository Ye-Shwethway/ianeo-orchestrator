# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Repository identity

IANEO Orchestrator is a lightweight personal Telegram command-center bot hosted as a **separate TypeScript Cloudflare Worker**. It provides one unified control surface over independent bots/services through service-specific adapters. It does not merge or replace existing bot repositories.

## Mandatory reconciliation order

Use this source-of-truth order:

1. verified live/runtime evidence
2. current repository implementation
3. `NEW_CHAT_BOOTSTRAP.md`
4. `ROADMAP.md`
5. `docs/ARCHITECTURE.md` and supporting docs
6. remembered chat context

Read `AGENTS.md` first, then this file, then `ROADMAP.md`, then task-relevant source/docs. Repository/runtime evidence wins over remembered context.

## Permanent continuity rule

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle before the work is considered complete.

A feature or infrastructure change is not complete if repository continuity documentation is stale. Before ending a substantial development session or merging a meaningful implementation PR, reconcile both files against actual repository and verified runtime state.

## Current architecture

Interactive runtime:

`Telegram -> webhook -> IANEO Cloudflare Worker -> adapter -> direct HTTPS/API -> target service`

Deployment:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

GitHub Actions are CI/deployment only, never interactive runtime. IANEO does not control another Telegram bot by messaging it and scraping replies; it calls the backend/service behind that bot.

The School of Nursing FAQ integration intentionally uses the FAQ Worker's Custom Domain so the first adapter remains direct HTTPS rather than a Cloudflare Service Binding:

`IANEO Worker -> https://faq.drthorne.uk -> school-of-nursing-faq-bot`

## Adapter contract

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Adapters translate this small common contract to each target's actual interface. No identical backend REST design is imposed.

## Current branch / PR

- Branch: `bootstrap/v0.1-foundation`
- PR: **#1 — Bootstrap IANEO Orchestrator v0.1 foundation**
- Base: `main`
- State: open and mergeable; user reports GitHub deployment credentials configured; final deployment-config update and CI verification are in progress

## Current implementation checkpoint

PR #1 contains:

- TypeScript Cloudflare Worker named `ianeo-orchestrator`
- IANEO `GET /health`
- Telegram `POST /telegram/webhook`
- Telegram webhook-secret verification
- owner-only access via `TELEGRAM_OWNER_ID`
- `/start`
- `/status`
- normalized adapter contract/registry
- targeted CI workflow
- Wrangler production-deployment workflow structure
- public-repository secret hygiene
- `FaqAdapter` using direct HTTPS to FAQ's existing `GET /health`
- `/status` aggregation of configured adapter health
- canonical Wrangler-managed `FAQ_SERVICE_URL = https://faq.drthorne.uk`
- `keep_vars = true` so dashboard-managed plaintext variables such as `TELEGRAM_OWNER_ID` are preserved across deploys

No existing bot repository was modified by the IANEO implementation.

## Cloudflare readiness checkpoint — 2026-08-21

Reported Cloudflare-side verified state:

- existing production FAQ Worker: `school-of-nursing-faq-bot`
- `faq.drthorne.uk` was unused, then attached as a Custom Domain to that Worker
- original FAQ workers.dev URL remains enabled
- `GET https://faq.drthorne.uk/health` returned HTTP 200 with:
  - `ok: true`
  - service `school-of-nursing-faq-bot`
  - environment `production`
- canonical IANEO FAQ base URL: `https://faq.drthorne.uk`
- `ianeo.drthorne.uk` is unused/available but intentionally not attached yet because `ianeo-orchestrator` does not exist until first deploy
- no empty IANEO Worker was manually created
- Telegram webhook has not been configured

Current Cloudflare docs confirm Custom Domains can be invoked from another Worker in the same zone via `fetch()`, unlike same-zone Routes. This preserves the canonical direct-HTTPS architecture.

## First-adapter reconnaissance result

### School of Nursing FAQ Bot — selected

Inspection confirmed an HTTP-native TypeScript Cloudflare Worker with:

- `GET /health`
- `POST /telegram/webhook`

Current FAQ capability is intentionally only `health`. The Telegram webhook is not a service-control API. `FAQ_SERVICE_URL` is now locked to the non-secret production value `https://faq.drthorne.uk` in Wrangler configuration.

### Observer Sandbox — deferred

Inspection confirmed:

- Python 3.11+ package
- CLI entry point `sandboxctl = observer_sandbox.cli:main`
- status/autonomy/Creator control paths use local Python/SQLite runtime code
- no declared HTTP server framework dependency
- no existing remote HTTP control surface found during repository inspection

Remote IANEO integration therefore requires a small authenticated bridge or another explicit remote callable surface. Do not modify Observer Sandbox for this without explicit authorization.

## Secrets/config boundary

Public repository: never commit real tokens, sensitive IDs, passwords, credentials, private `.env` content, or sensitive logs.

GitHub Actions deployment credentials:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The user reports both repository Actions secrets have been configured. Their actual values are not stored or exposed in source.

Cloudflare Worker runtime secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- future service-specific bearer tokens

Cloudflare Worker non-secret configuration:

- `FAQ_SERVICE_URL` — Wrangler-managed and committed as `https://faq.drthorne.uk`
- `TELEGRAM_OWNER_ID` — dashboard-managed plaintext variable

Wrangler has `keep_vars = true`, which preserves dashboard-managed variables not declared in Wrangler configuration on future deployments. Secrets are not deleted by normal Wrangler deployments.

## Validation state

Current toolchain:

- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

PR #1 previously produced successful GitHub Actions dependency-install and TypeScript type-check runs. The latest deployment-readiness update changes Wrangler configuration and documentation; confirm the final head CI result before merge.

## Production state

IANEO is **not deployed or runtime-verified yet**.

Still required:

- confirm final PR-head CI green
- merge PR #1 to `main`
- observe first production Wrangler deployment/create `ianeo-orchestrator`
- configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` as Worker secrets
- configure `TELEGRAM_OWNER_ID` as a Worker plaintext variable
- verify IANEO health on the first deployed hostname
- attach and verify `ianeo.drthorne.uk`
- register Telegram webhook only after the production hostname is verified
- verify owner-only `/start`, `/status`, and FAQ health through IANEO
- reconcile continuity docs against verified live state

Do not claim production success before live evidence exists.

## Active integrations

- School of Nursing FAQ Bot: **read-only health adapter implemented; FAQ Custom Domain live-verified; FAQ-through-IANEO not yet live-verified**
- Observer Sandbox: **recon complete; remote bridge required; no target change implemented**
- Outline Manager: pending
- URL Uploader: pending
- GitHub: pending
- Cloudflare control surface: pending

## Important invariants

- existing services stay independent
- direct HTTPS/API runtime integration
- no GitHub Actions in interactive path
- no Telegram bot-to-bot integration bus
- minimal target-repository changes
- separate service credentials where practical
- deterministic routing first
- sensitive actions require confirmation
- no unnecessary DB, queue, Durable Object, event bus, microservice framework, or premature multi-agent system
- small reviewable slices

## Next planned slice

Finish **v0.1 production deployment and live verification** before adding another integration:

1. confirm final PR-head targeted CI is green;
2. merge PR #1 to `main`;
3. observe first Wrangler deployment and verify `ianeo-orchestrator` creation;
4. configure Telegram Worker runtime secrets and `TELEGRAM_OWNER_ID`;
5. verify IANEO Worker health;
6. attach and verify `ianeo.drthorne.uk`;
7. register Telegram webhook;
8. verify `/start`, `/status`, and FAQ health end to end;
9. update both continuity docs from verified runtime evidence.

After v0.1 is live, choose either a genuinely useful richer FAQ backend surface or a separately authorized minimum Observer HTTP bridge. Do not expand the registry merely for breadth.

## One-line handoff

Current truth: PR #1 remains open; GitHub deployment credentials are reported configured; FAQ now has the live Custom Domain `faq.drthorne.uk`; Wrangler is configured with that canonical URL plus `keep_vars = true`; final PR-head CI must pass before merge, and IANEO itself is still undeployed/unverified.
