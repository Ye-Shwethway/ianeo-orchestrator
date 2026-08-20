# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle. A feature or infrastructure change is not complete while continuity documentation is stale.

## Project goal

Build **IANEO Orchestrator** as a lightweight personal Telegram command-center bot providing one unified interface for controlling and accessing multiple independent bots and services.

IANEO is the unified Telegram front door, control plane, adapter/facade layer, and capability router. It is not a monolithic replacement for existing systems.

Target integrations include Outline Manager Bot, URL Uploader Bot, School of Nursing FAQ Bot, Observer Sandbox, GitHub, Cloudflare, and future personal services.

## Locked architecture

- Runtime: TypeScript Cloudflare Worker.
- Telegram ingress: webhook.
- Service runtime integration: direct HTTPS/API through service-specific adapters.
- `workers.dev` is sufficient for bootstrap; `ianeo.drthorne.uk` is optional later.
- Service URLs are configurable; never hard-code physical hosts/IPs.
- GitHub Actions are CI/validation/deployment only and never part of interactive orchestration.
- Telegram bot-to-bot messaging is not the integration bus.

Interactive path:

`Telegram -> IANEO Worker -> adapter -> direct HTTPS/API -> target service`

Deployment path:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

### Adapter contract

Keep the normalized contract small:

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Adapters translate this contract to each backend's real interface. Existing systems do not need identical REST APIs.

### Existing-service policy

Inspect callable surfaces first. Prefer zero-change integration. If none exists, add only the smallest authenticated bridge needed. Avoid architectural rewrites of existing bots.

### Secrets

Public repository. Never commit real credentials or sensitive logs.

- GitHub Actions Secrets: deployment credentials only.
- Cloudflare Worker secrets: Telegram/runtime credentials and future service-specific bearer tokens.
- Non-secret endpoint values such as `FAQ_SERVICE_URL` may be Worker vars/environment bindings.
- Prefer separate credentials per service; no global master token.

### UX and safety

Deterministic routing first; AI intent routing deferred.

Current commands:

- `/start`
- `/status`

Action classes remain Read, Normal Write, and Sensitive Control. Sensitive/destructive controls require confirmation when introduced.

## Resource discipline

Personal-use system. Avoid unnecessary databases, Durable Objects, queues, event buses, microservice frameworks, Kubernetes/service meshes, and premature AI/multi-agent architecture.

Baseline:

`Cloudflare Worker + Telegram + adapters + HTTPS + secrets`

## v0.1 — Deployable foundation + first real read path

Status: **PR #1 OPEN — validated on branch, awaiting merge/deployment setup**

Completed:

- [x] continuity governance and source-of-truth rules
- [x] concrete architecture/invariants
- [x] minimal TypeScript Cloudflare Worker
- [x] Telegram webhook-secret verification
- [x] owner-only bootstrap access
- [x] `/start`
- [x] `/status`
- [x] adapter contract/registry
- [x] targeted CI
- [x] Wrangler production-deploy workflow structure
- [x] public-repository secret hygiene
- [x] read-only reconnaissance of Observer Sandbox and School of Nursing FAQ Bot
- [x] first adapter selected: School of Nursing FAQ Bot
- [x] `FaqAdapter` added without modifying the FAQ repository
- [x] direct HTTPS FAQ `GET /health` integration
- [x] `/status` aggregates configured adapter health
- [x] `FAQ_SERVICE_URL` configurable as a non-secret binding
- [x] GitHub Actions CI run #13 completed successfully on the implementation head (dependency install + TypeScript type-check workflow)

Still pending:

- [ ] final docs-only head CI confirmation
- [ ] merge PR #1 to `main`
- [ ] configure GitHub deployment secrets
- [ ] configure IANEO Worker runtime secrets
- [ ] configure verified production `FAQ_SERVICE_URL`
- [ ] first production Wrangler deployment
- [ ] register Telegram webhook
- [ ] verify `/start`, `/status`, and FAQ health live

Current toolchain:

- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

## First-adapter reconnaissance — 2026-08-21

### School of Nursing FAQ Bot — selected

Observed:

- TypeScript Cloudflare Worker
- existing `GET /health`
- existing `POST /telegram/webhook`
- health response includes `ok`, service identity, and environment

Decision: use FAQ as the first adapter because a useful read-only integration needs zero target-repository changes. v0.1 exposes only the existing health capability. The Telegram webhook is not treated as a service-control API.

If richer FAQ control is needed later, assess the smallest authenticated `/internal/v1/...` bridge rather than refactoring the bot.

### Observer Sandbox — deferred

Observed:

- Python 3.11+ package
- CLI entry point `sandboxctl = observer_sandbox.cli:main`
- status/autonomy/Creator controls operate through local Python/SQLite runtime paths
- no HTTP server framework dependency declared
- no existing remote HTTP control surface found during repository inspection

Decision: Observer remote integration requires a small authenticated bridge or equivalent callable surface on its host. No Observer repository change is authorized or implemented in this slice.

This contrast validates the adapter model: FAQ is zero-change HTTP integration; Observer can later receive a tiny service-specific bridge without forcing either backend into a shared architecture.

## Validation state

GitHub Actions CI run #13 for the implementation head completed successfully. This is verified repository evidence that the CI workflow reached a successful conclusion. The latest docs-sync commits must also finish cleanly before merge.

## Production state

**Not deployed.** No IANEO production Worker, Telegram webhook, or live FAQ-through-IANEO path has been verified yet. Do not describe repository success as production success.

## Next planned slice

Finish v0.1 deployment verification before adding another integration:

1. confirm the final PR head CI is green;
2. merge PR #1 to `main`;
3. configure deployment/runtime values without committing secrets;
4. deploy the separate IANEO Worker;
5. register Telegram webhook;
6. verify owner-only `/start` and `/status`;
7. verify FAQ health through direct HTTPS from IANEO;
8. reconcile both continuity docs against verified live evidence.

After v0.1 is live, choose between a genuinely useful richer FAQ backend surface or a separately authorized minimum Observer bridge. Do not add integrations merely for breadth.
