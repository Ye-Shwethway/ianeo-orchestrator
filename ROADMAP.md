# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle. A feature or infrastructure change is not complete while continuity documentation is stale.

## Project goal

Build **IANEO Orchestrator** as a lightweight personal Telegram command-center bot providing one unified interface for controlling and accessing multiple existing bots and services.

IANEO is a control plane, adapter/facade layer, capability router, and unified Telegram front door. It is **not** a monolithic replacement for the systems behind it.

Target integrations include:

- Outline Manager Bot
- URL Uploader Bot
- School of Nursing FAQ Bot
- Observer Sandbox
- GitHub
- Cloudflare
- future personal bots/services

Existing systems remain independent repositories and deployments.

## Locked architecture decisions

### Runtime and hosting

- IANEO Orchestrator runs as a **TypeScript Cloudflare Worker**.
- Telegram reaches the Worker through a webhook.
- The Worker reaches target services primarily through direct HTTPS/API calls.
- `workers.dev` is sufficient for bootstrap; `ianeo.drthorne.uk` is an optional later stable identity.
- Service endpoints are configurable. Do not hard-code physical hosts or IP addresses.

### Runtime communication

Interactive path:

`Telegram -> IANEO Worker -> service adapter -> direct HTTPS -> target service`

GitHub Actions MUST NOT be used for bot-to-bot runtime communication. Actions are limited to CI, validation, deployment, and Wrangler publishing.

Telegram bot-to-bot messaging is not an integration bus. IANEO talks to the service/backend behind another bot.

### Adapter model

IANEO exposes a small normalized orchestration concept:

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

Individual adapters translate that contract into the real interface of each backend. Backends do not need to share an identical REST API.

### Existing service modification policy

Inspect first for existing HTTP endpoints, APIs, RPC/service interfaces, queues, callable backend functions, or admin routes. Prefer zero-change integration where possible. If no callable external surface exists, add only the smallest bridge necessary. Avoid architectural rewrites of existing bots.

### Authentication and secrets

Repository is public.

GitHub Actions Secrets are deployment-only, e.g.:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Worker secrets hold runtime credentials, e.g.:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_OWNER_ID`
- service-specific bearer tokens

Use separate credentials per integration where practical. Do not create one global master service token.

### Telegram UX and safety

Start deterministic; AI intent routing is deferred.

Initial commands:

- `/start`
- `/status`

Future command-center sections may include Outline Manager, URL Uploader, FAQ Bot, Observer Sandbox, GitHub, Cloudflare, and System.

Action classes:

1. Read — status, health, logs, stats, list
2. Normal Write — create/submit/update supported content
3. Sensitive Control — deploy, restart, pause, resume, delete, destructive administration

Sensitive controls require confirmation when implemented.

## Resource discipline

This is a personal-use system. Avoid Kubernetes, service meshes, generic event buses, unnecessary databases, unnecessary Durable Objects, unnecessary queues, premature AI-agent architecture, and large plugin frameworks.

Baseline stack:

`Cloudflare Worker + Telegram + adapters + HTTPS + secrets`

## Version roadmap

### v0.1 — Deployable Orchestrator foundation

Status: **PR #1 OPEN — `bootstrap/v0.1-foundation` -> `main`**

Foundation scope:

- [x] repository continuity governance
- [x] explicit architecture and runtime invariants
- [x] minimal TypeScript Cloudflare Worker structure
- [x] Telegram webhook receiver foundation
- [x] owner-only access foundation
- [x] `/start`
- [x] `/status`
- [x] minimal adapter interface and registry, with no external service forced yet
- [x] targeted CI structure
- [x] Wrangler production deployment workflow structure
- [x] public-repository secret hygiene
- [x] foundation PR opened as PR #1
- [ ] PR #1 validation/review
- [ ] merge PR #1 to `main`
- [ ] configure GitHub deployment secrets
- [ ] configure Cloudflare Worker runtime secrets
- [ ] first production Wrangler deployment
- [ ] register Telegram webhook against the production Worker
- [ ] verify `/start` and `/status` live

### v0.1.1 — First adapter selection and minimum real integration

Status: **PROPOSED — not yet implemented**

Before choosing an adapter, inspect two contrasting systems without modifying them, preferably:

- Observer Sandbox
- School of Nursing FAQ Bot

For each inspect hosting, runtime, API surface, Telegram handler structure, service/business separation, authentication, database dependency, health/admin endpoints, and minimum bridge required.

Then choose the smallest useful first adapter and implement one end-to-end direct HTTPS integration.

### Later slices

- additional adapters one at a time
- richer inline-button command-center UX
- service status aggregation
- normal write actions
- confirmed sensitive controls
- optional stable `ianeo.drthorne.uk` route
- optional natural-language routing only after deterministic control paths are reliable

## Known external context

- Outline Manager: VPS-hosted
- URL Uploader: VPS-hosted
- School of Nursing FAQ Bot: separate Cloudflare Worker using Wrangler, Modules format, D1, and scheduled functionality
- Observer Sandbox: separate project
- IANEO Orchestrator: separate Cloudflare Worker
- `drthorne.uk`: managed through Cloudflare
- Cloudflare Workers plan: Free

The old FAQ test Worker and test D1 are removed; IANEO must not be combined with the FAQ production Worker.

## Development process

Preferred cycle:

`inspect -> document decision -> implement minimum runnable slice -> validate -> update continuity docs -> PR -> merge -> verify deployment -> reconcile docs again if runtime state changed`

Avoid giant foundation PRs and unnecessary abstraction.

## Current implementation state

The repository began with continuity docs only. PR #1 now contains the concrete IANEO architecture plus the minimal Worker/Telegram/adapter/CI/deployment foundation.

No existing bot repository has been modified and no external service integration has been implemented.

## Current production state

**Not deployed.** No IANEO production Worker or Telegram webhook has been verified yet.

## Next proposed slice

After PR #1 is validated/merged and the Worker foundation is deployable, inspect Observer Sandbox and the School of Nursing FAQ Bot read-only, compare their integration surfaces, and select the smallest useful first adapter for **v0.1.1**.
