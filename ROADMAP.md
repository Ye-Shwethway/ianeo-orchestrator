# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle. A feature or infrastructure change is not complete while continuity documentation is stale.

## Project goal

Build **IANEO Orchestrator** as a lightweight personal Telegram command-center bot providing one unified interface for controlling and accessing multiple existing bots and services.

IANEO is a unified Telegram front door, control plane, adapter/facade layer, and capability router. It is **not** a monolithic replacement for existing systems.

Target integrations include Outline Manager Bot, URL Uploader Bot, School of Nursing FAQ Bot, Observer Sandbox, GitHub, Cloudflare, and future personal bots/services. Existing systems remain independent repositories and deployments.

## Locked architecture decisions

### Runtime and hosting

- TypeScript Cloudflare Worker.
- Telegram reaches IANEO by webhook.
- IANEO reaches target services primarily by direct HTTPS/API calls.
- `workers.dev` is sufficient during bootstrap; `ianeo.drthorne.uk` is optional later.
- Service URLs are configurable; do not hard-code physical hosts or IPs.

Interactive path:

`Telegram -> IANEO Worker -> service adapter -> direct HTTPS/API -> target service`

Deployment path:

`GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`

GitHub Actions MUST NOT sit in the interactive runtime path. Telegram bot-to-bot messaging MUST NOT be used as the integration bus.

### Adapter model

The normalized service concept remains intentionally small:

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Each adapter translates this contract to the backend's actual interface. Backends do not need identical REST APIs.

### Existing service modification policy

Inspect existing callable surfaces first. Prefer zero-change integration. If no remote callable interface exists, prefer the smallest authenticated bridge necessary rather than refactoring the service.

### Authentication and secrets

The repository is public.

GitHub Actions Secrets contain deployment credentials only, such as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Cloudflare Worker secrets contain runtime credentials, such as Telegram credentials and future service-specific bearer tokens. Use separate service credentials where practical; do not create one global master token.

Non-secret endpoint configuration such as `FAQ_SERVICE_URL` may be supplied as a Worker variable/environment binding.

### Telegram UX and safety

Routing begins deterministic. AI intent routing is deferred.

Current commands:

- `/start`
- `/status`

Action classes remain Read, Normal Write, and Sensitive Control. Sensitive/destructive controls require confirmation when introduced.

## Resource discipline

Personal-use system. Avoid Kubernetes, service meshes, generic event buses, unnecessary databases, unnecessary Durable Objects/queues, premature AI-agent architecture, and large plugin frameworks.

Baseline:

`Cloudflare Worker + Telegram + adapters + HTTPS + secrets`

## v0.1 — Deployable foundation + first real read path

Status: **PR #1 OPEN — `bootstrap/v0.1-foundation` -> `main`**

Completed on branch:

- [x] continuity governance and source-of-truth rules
- [x] concrete architecture/invariants
- [x] minimal TypeScript Cloudflare Worker
- [x] Telegram webhook secret verification
- [x] owner-only access foundation
- [x] `/start`
- [x] `/status`
- [x] normalized adapter contract and registry
- [x] targeted CI structure
- [x] Wrangler production deployment workflow structure
- [x] public-repository secret hygiene
- [x] PR #1 opened
- [x] current package versions checked against npm metadata
- [x] read-only reconnaissance of Observer Sandbox and School of Nursing FAQ Bot
- [x] first adapter selected: School of Nursing FAQ Bot
- [x] `FaqAdapter` added without modifying the FAQ repository
- [x] FAQ adapter uses existing `GET /health` through direct HTTPS
- [x] `/status` now aggregates configured adapter status
- [x] `FAQ_SERVICE_URL` added as configurable non-secret endpoint binding

Still pending:

- [ ] CI/type-check verification
- [ ] PR #1 review/merge
- [ ] configure GitHub deployment secrets
- [ ] configure IANEO Cloudflare Worker runtime secrets
- [ ] configure `FAQ_SERVICE_URL` with the verified production FAQ Worker URL
- [ ] first production Wrangler deployment
- [ ] register Telegram webhook
- [ ] verify `/start`, `/status`, and FAQ health from live IANEO

Current bootstrap toolchain:

- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

## First-adapter reconnaissance — 2026-08-21

### School of Nursing FAQ Bot

Observed repository shape:

- Cloudflare Worker / TypeScript runtime
- already exposes `GET /health`
- Telegram enters through `POST /telegram/webhook`
- health response reports `ok`, service identity, and environment
- existing `/health` enables a useful zero-change read integration

Decision: use FAQ as the first real adapter. v0.1 only exposes the existing read-only health capability. Do **not** treat its Telegram webhook as a service-control API.

If richer FAQ status/control is needed later, first assess whether existing internals can support a tiny authenticated `/internal/v1/...` bridge. Do not refactor the FAQ bot merely for IANEO.

### Observer Sandbox

Observed repository shape:

- Python 3.11+ package
- CLI entry point: `sandboxctl = observer_sandbox.cli:main`
- runtime/status/autonomy/creator operations are exposed through local Python/SQLite-backed CLI code
- project dependencies currently contain no HTTP server framework
- repository inspection did not reveal an existing remote HTTP control surface

Decision: do not choose Observer as the first adapter. Remote IANEO integration would presently require a small authenticated HTTP bridge (or another explicit remote callable surface) on the Observer host. That target-repository change requires separate authorization.

The contrast validates the adapter philosophy: FAQ can be zero-change HTTP integration while Observer will need a service-specific bridge without forcing either backend into a common architecture.

## Next proposed slice

### v0.1 deployment verification

Before expanding capabilities, finish and verify the current minimum runnable slice:

1. validate PR #1 CI/type-check;
2. merge to `main` when clean;
3. configure deployment/runtime values without committing secrets;
4. deploy the separate IANEO Worker;
5. configure Telegram webhook;
6. verify owner-only `/start` and `/status`;
7. verify FAQ health through direct HTTPS from IANEO;
8. reconcile both continuity docs against live evidence.

### After v0.1 is live

Proposed next integration work is either:

- add richer FAQ status through the smallest authenticated backend surface if genuinely useful, or
- design the minimum Observer HTTP bridge separately and request explicit authorization before modifying Observer Sandbox.

Do not add more integrations merely to fill the registry.

## Known external context

- Outline Manager -> VPS
- URL Uploader -> VPS
- School of Nursing FAQ Bot -> separate Cloudflare Worker
- Observer Sandbox -> separate Python runtime/project
- IANEO Orchestrator -> separate Cloudflare Worker
- `drthorne.uk` -> Cloudflare-managed
- Cloudflare Workers plan -> Free

IANEO must remain separate from the FAQ Worker.

## Validation and production state

Package versions have been checked against current npm metadata. Local dependency install/type-check could not be completed in the current container because outbound dependency access was unavailable, and a GitHub PR workflow run has not yet been verified through the connector. Therefore CI remains **pending/unverified**, not passed.

IANEO is **not deployed** and no Telegram or FAQ integration has been live-verified yet. Repository implementation must not be described as production success until verified runtime evidence exists.
