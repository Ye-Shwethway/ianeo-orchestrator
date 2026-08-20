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
- State: open, mergeable; final docs-sync head still needs CI confirmation before merge

## Current implementation checkpoint

PR #1 contains:

- TypeScript Cloudflare Worker
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
- configurable `FAQ_SERVICE_URL`
- `FaqAdapter` using direct HTTPS to FAQ's existing `GET /health`
- `/status` aggregation of configured adapter health

No existing bot repository has been modified.

## First-adapter reconnaissance result

### School of Nursing FAQ Bot — selected

Inspection confirmed an HTTP-native TypeScript Cloudflare Worker with:

- `GET /health`
- `POST /telegram/webhook`

The health endpoint returns `ok`, service identity, and environment. This supports a useful zero-change read-only adapter.

Current FAQ capability is intentionally only `health`. The Telegram webhook is not a service-control API. `FAQ_SERVICE_URL` is a configurable non-secret endpoint binding; its real production value has not yet been configured or live-verified in IANEO.

### Observer Sandbox — deferred

Inspection confirmed:

- Python 3.11+ package
- CLI entry point `sandboxctl = observer_sandbox.cli:main`
- status/autonomy/Creator control paths use local Python/SQLite runtime code
- no declared HTTP server framework dependency
- no existing remote HTTP control surface found during repository inspection

Remote IANEO integration would therefore require a small authenticated bridge or another explicit remote callable surface. Do not modify Observer Sandbox for this without explicit authorization.

The comparison validates the adapter architecture: FAQ uses zero-change HTTP integration while Observer can later use its own minimal bridge without forcing either backend into a shared architecture.

## Secrets/config boundary

Public repository: never commit real tokens, sensitive IDs, passwords, credentials, private `.env` content, or sensitive logs.

- GitHub Actions Secrets: deployment credentials such as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Cloudflare Worker secrets: Telegram/runtime credentials and future service-specific bearer tokens.
- Non-secret service endpoints such as `FAQ_SERVICE_URL`: plain Worker vars/environment bindings.

Prefer separate credentials per integration; no global master token.

## Validation state

Current toolchain:

- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

GitHub Actions **CI run #13 completed successfully** on the implementation head. The workflow reached success after dependency setup and TypeScript type-check validation.

The continuity-doc sync commits created after that success are newer than run #13, so the **final PR head must still be confirmed green before merge**.

## Production state

IANEO is **not deployed or runtime-verified yet**.

Still required:

- confirm final PR head CI
- merge PR #1
- configure GitHub deployment secrets
- configure IANEO Worker Telegram/runtime secrets
- configure verified production `FAQ_SERVICE_URL`
- deploy via Wrangler
- register Telegram webhook
- verify owner-only `/start` and `/status`
- verify FAQ health through IANEO direct HTTPS
- reconcile continuity docs against verified live state

Do not claim production success before live evidence exists.

## Active integrations

- School of Nursing FAQ Bot: **read-only health adapter implemented; not live-verified**
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

Finish **v0.1 deployment verification** before adding another integration:

1. confirm final PR head CI green;
2. merge PR #1;
3. configure deployment/runtime values without committing secrets;
4. deploy the separate IANEO Worker;
5. register Telegram webhook;
6. verify `/start`, `/status`, and FAQ health end to end;
7. update both continuity docs from verified runtime evidence.

After v0.1 is live, choose either a genuinely useful richer FAQ backend surface or a separately authorized minimum Observer HTTP bridge. Do not expand the registry merely for breadth.

## One-line handoff

Current truth: PR #1 contains the separate Cloudflare Worker Telegram command-center foundation plus the first zero-change FAQ health adapter; Observer needs a small remote bridge; implementation CI has passed, final docs-sync head still needs CI confirmation, and production remains unverified.
