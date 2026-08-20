# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Repository identity

IANEO Orchestrator is a lightweight personal Telegram command-center bot hosted as a **separate TypeScript Cloudflare Worker**. It provides one unified control surface over independent bots/services through service-specific adapters.

It does not merge or replace existing bot repositories.

## Mandatory source-of-truth order

For every new development chat, reconcile in this order:

1. verified live/runtime evidence
2. current repository implementation
3. `NEW_CHAT_BOOTSTRAP.md`
4. `ROADMAP.md`
5. `docs/ARCHITECTURE.md` and supporting docs
6. remembered chat context

Read `AGENTS.md` first, then this file, then `ROADMAP.md`, then task-relevant source/docs. Repository/runtime evidence wins over remembered context.

## Permanent continuity rule

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle before the work is considered complete.

A feature or infrastructure change is not complete if repository continuity documentation is stale.

Before ending a substantial development session or merging a meaningful implementation PR, reconcile both files against the actual repository and verified runtime state.

## Current architecture

Interactive runtime:

`Telegram -> webhook -> IANEO Cloudflare Worker -> adapter -> direct HTTPS/API -> target service`

Deployment:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

GitHub Actions are CI/deployment only, never the interactive bot-to-bot runtime. IANEO must not send Telegram commands to another bot and scrape the reply; it calls the backend/service behind that bot.

## Adapter contract

The core contract is deliberately small:

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Each adapter translates this to the target system's actual interface. No common backend REST shape is imposed.

## Current branch / PR

- Branch: `bootstrap/v0.1-foundation`
- Open PR: **#1 — Bootstrap IANEO Orchestrator v0.1 foundation**
- Base: `main`

PR #1 now contains the minimum Worker/Telegram/adapter/CI/deployment foundation **plus the first real read-only service adapter**.

## Current implementation checkpoint

Implemented on the branch:

- TypeScript Cloudflare Worker
- `GET /health` for IANEO
- Telegram `POST /telegram/webhook`
- Telegram webhook-secret verification
- owner-only access via `TELEGRAM_OWNER_ID`
- `/start`
- `/status`
- normalized adapter interface/registry
- targeted CI workflow
- Wrangler production-deployment workflow structure
- public-repository secret hygiene
- configurable `FAQ_SERVICE_URL`
- `FaqAdapter` using direct HTTPS to the FAQ Worker's existing `GET /health`
- `/status` health aggregation for configured adapters

No existing bot repository has been modified.

## First-adapter reconnaissance result

### School of Nursing FAQ Bot — selected first

Repository inspection confirmed it is already an HTTP-native TypeScript Cloudflare Worker. Its production code exposes:

- `GET /health`
- `POST /telegram/webhook`

The health endpoint returns `ok`, service identity, and environment. Therefore IANEO can perform a useful read-only health integration with **zero FAQ repository changes**.

Current FAQ adapter capability is intentionally only `health`. The Telegram webhook is not treated as a service-control API.

`FAQ_SERVICE_URL` is a configurable non-secret endpoint binding. The real production URL has not yet been configured/verified in IANEO.

### Observer Sandbox — deferred

Repository inspection confirmed a Python 3.11+ package with CLI entry point `sandboxctl = observer_sandbox.cli:main`. Status, autonomy, and Creator control paths operate through Python code and the local SQLite-backed runtime. The project currently declares no HTTP server framework dependency, and inspection did not reveal an existing remote HTTP control surface.

Therefore remote IANEO control of Observer would currently require a **small authenticated bridge** on the Observer host (or another explicit remote callable surface). Do not modify Observer Sandbox for this without explicit authorization.

This comparison validates the adapter architecture: FAQ needs zero-change HTTP translation; Observer can later use its own tiny bridge without refactoring either system into a shared backend design.

## Secrets and configuration boundary

Public repository: never commit real credentials, secret IDs, passwords, tokens, private `.env` content, or sensitive logs.

GitHub Actions Secrets are deployment-only, e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Cloudflare Worker secrets hold runtime secrets such as `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_OWNER_ID`, and future service-specific bearer tokens.

Non-secret service URLs such as `FAQ_SERVICE_URL` can be plain Worker vars/environment bindings.

## Current validation state

Current package metadata on the branch:

- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

Package versions were checked against current npm metadata. A full dependency install/type-check has not yet been verified in the current environment, and a GitHub PR workflow run has not yet been confirmed through the connector.

**CI/type-check is pending. Do not describe it as passed.**

## Current production state

IANEO is **not deployed or runtime-verified yet**.

Still required:

- validate PR #1 CI/type-check
- merge PR #1 when clean
- configure GitHub deployment secrets
- configure IANEO Worker Telegram secrets
- configure the verified production `FAQ_SERVICE_URL`
- deploy with Wrangler
- register Telegram webhook
- verify owner-only `/start` and `/status`
- verify FAQ health through IANEO direct HTTPS
- reconcile continuity docs against verified live state

Do not claim production success before live evidence exists.

## Active integrations

- School of Nursing FAQ Bot: **implemented in repository as read-only health adapter; not yet live-verified**
- Observer Sandbox: **reconnaissance complete; remote bridge required; no modification authorized/implemented**
- Outline Manager: pending
- URL Uploader: pending
- GitHub: pending
- Cloudflare control surface: pending

## Important invariants

- existing services remain independent
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

1. get PR #1 validation green;
2. merge to `main`;
3. configure Cloudflare/GitHub values without committing secrets;
4. deploy the IANEO Worker;
5. register Telegram webhook;
6. verify `/start`, `/status`, and FAQ health end to end;
7. update both continuity docs from verified runtime evidence.

After v0.1 is live, decide between a genuinely useful richer FAQ backend surface or a separately authorized minimum Observer HTTP bridge. Do not expand the registry just for breadth.

## One-line handoff

Current truth: PR #1 contains a separate Cloudflare Worker Telegram command-center foundation and the first real zero-change FAQ health adapter; Observer reconnaissance shows it needs a tiny remote bridge; CI and production remain unverified; the next task is to get v0.1 validated, deployed, and live-verified before adding more integrations.
