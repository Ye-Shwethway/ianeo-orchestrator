# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Repository identity

IANEO Orchestrator is a lightweight personal Telegram command-center bot hosted as a separate Cloudflare Worker. It provides one unified control surface over multiple existing bots/services through service-specific adapters.

It does **not** merge existing bot repositories and is not intended to replace them.

## Mandatory reconciliation order

For every new development chat, reconcile in this order:

1. verified live/runtime evidence
2. current repository implementation
3. `NEW_CHAT_BOOTSTRAP.md`
4. `ROADMAP.md`
5. `docs/ARCHITECTURE.md` and other supporting docs
6. remembered chat context

Read order:

1. `AGENTS.md`
2. `NEW_CHAT_BOOTSTRAP.md`
3. `ROADMAP.md`
4. task-relevant architecture/source files

If remembered context conflicts with repository/runtime evidence, repository/runtime evidence wins.

## Permanent continuity rule

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle before the work is considered complete.

A feature or infrastructure change is not complete if repository continuity documentation is stale.

Before ending a substantial development session or merging a meaningful implementation PR, reconcile both files against the actual repository and verified runtime state.

## Current architecture

Interactive runtime path:

`Telegram -> webhook -> IANEO Cloudflare Worker -> adapter -> direct HTTPS/API -> target service`

Deployment path:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

GitHub Actions are **not** part of interactive bot-to-bot communication. They are only for CI/validation/deployment/publishing.

IANEO must not control other Telegram bots by sending them Telegram messages and scraping replies. It calls their underlying services/backends.

## Adapter contract

The core uses a small normalized adapter concept:

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Adapters translate this common contract to each target system's actual API/interface. Existing systems may remain Python, TypeScript, Cloudflare Worker, VPS-hosted, database-backed, or otherwise architecturally different.

## Hosting/network assumptions

Known distribution:

- Outline Manager -> VPS
- URL Uploader -> VPS
- School of Nursing FAQ Bot -> Cloudflare Worker
- IANEO Orchestrator -> Cloudflare Worker
- Observer Sandbox -> separate project/runtime

Target URLs must be configurable. Do not hard-code physical IPs/hosts.

Possible later stable names include `ianeo.drthorne.uk`, `outline.drthorne.uk`, `upload.drthorne.uk`, `faq.drthorne.uk`, and `sandbox.drthorne.uk`, but none are required for bootstrap.

## Secrets boundary

This repository is public.

GitHub Actions secrets are deployment credentials only, such as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Cloudflare Worker secrets are runtime credentials, such as `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_OWNER_ID`, and future service-specific bearer tokens.

Never commit real secrets, sensitive IDs, passwords, credentials, private `.env` files, or sensitive logs.

## Latest completed checkpoint

Open PR: **#1 — Bootstrap IANEO Orchestrator v0.1 foundation**

Branch: `bootstrap/v0.1-foundation`

PR #1 currently establishes:

- concrete IANEO architecture/governance
- TypeScript Cloudflare Worker bootstrap
- Telegram webhook receiver foundation
- owner-only access foundation
- `/start`
- `/status`
- minimal adapter contract and registry
- targeted CI workflow structure
- Wrangler production deployment workflow structure
- architecture documentation and public-repository secret hygiene

No existing bot repository has been modified.

## Current production state

IANEO is **not yet deployed or runtime-verified**.

Still required after PR validation/merge and setup:

- configure GitHub deployment secrets
- configure Cloudflare Worker runtime secrets
- deploy Worker with Wrangler
- set Telegram webhook
- verify owner-only `/start` and `/status`

Do not claim production success until verified live evidence exists.

## Active integrations

External integrations: **none yet**.

The adapter foundation exists, but the first real external adapter has intentionally not been selected until existing service surfaces are inspected.

## Important constraints

- existing bots stay independent
- direct HTTPS/API runtime integration
- no GitHub Actions in interactive path
- no Telegram bot-to-bot integration bus
- minimal changes to existing services
- separate bearer token per service where practical
- deterministic routing first; AI intent routing deferred
- sensitive/destructive actions require confirmation when introduced
- no unnecessary DB, queue, Durable Object, event bus, microservice framework, or multi-agent architecture
- keep slices small and reviewable

## Known issues / unverified state

- PR #1 validation/review is still pending.
- PR #1 is not yet merged to `main`.
- Cloudflare project/secrets have not yet been configured for IANEO.
- Telegram webhook has not yet been registered.
- First external adapter has not yet been chosen.
- CI/deploy workflow structure still needs real execution/verification.

## Next proposed slice

After PR #1 validation/merge and foundation deployability, perform **read-only integration reconnaissance** on two contrasting systems, preferably Observer Sandbox and School of Nursing FAQ Bot.

Inspect hosting, runtime, API surface, Telegram handlers, business/service separation, authentication, database dependency, health/admin endpoints, and minimum bridge required. Do not modify those repositories during reconnaissance unless explicitly authorized.

Then propose the smallest useful first adapter for v0.1.1 and stop for approval before modifying an existing service.

## One-line handoff

Current truth: PR #1 contains the concrete IANEO Cloudflare Worker command-center foundation using Telegram ingress and direct HTTPS adapters; production is not yet verified, no external adapter is connected yet, and the next integration step after foundation validation/merge is read-only comparison of candidate backend surfaces before choosing the first real adapter.
