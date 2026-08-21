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
- Production FAQ endpoint: `https://faq.drthorne.uk`, attached as a Custom Domain to the existing FAQ Worker.
- Initial IANEO deployment keeps `workers.dev` enabled; `ianeo.drthorne.uk` is reserved/available for attachment after the first successful deployment.
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

### Secrets and runtime configuration

The repository is public. Never commit real credentials or sensitive logs.

- GitHub Actions Secrets: deployment credentials only (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- Cloudflare Worker secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and future service-specific bearer tokens.
- `TELEGRAM_OWNER_ID`: non-secret dashboard-managed Worker variable.
- `FAQ_SERVICE_URL`: non-secret Wrangler-managed Worker variable, currently `https://faq.drthorne.uk`.
- `keep_vars = true` preserves dashboard-managed plaintext vars such as `TELEGRAM_OWNER_ID` across Wrangler deployments; Wrangler-managed vars remain source-controlled.
- Prefer separate credentials per service; never one global master token.

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

Status: **PR #1 OPEN — implementation validated; GitHub deployment credentials are reported configured; final pre-merge validation in progress**

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
- [x] FAQ Custom Domain established as `faq.drthorne.uk` and reported live-verified with production health response
- [x] canonical `FAQ_SERVICE_URL` committed as `https://faq.drthorne.uk`
- [x] `keep_vars = true` added so dashboard-managed plaintext runtime vars can survive Wrangler deploys
- [x] user reports GitHub Actions deployment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` configured
- [x] successful GitHub Actions dependency-install + TypeScript type-check validation observed on PR #1 before the final deployment-config update

Still pending:

- [ ] run/observe targeted CI on the final pre-merge PR head
- [ ] merge PR #1 to `main` when required checks are green
- [ ] first production Wrangler deployment/create `ianeo-orchestrator`
- [ ] configure IANEO Worker runtime secret `TELEGRAM_BOT_TOKEN`
- [ ] configure IANEO Worker runtime secret `TELEGRAM_WEBHOOK_SECRET`
- [ ] configure dashboard-managed `TELEGRAM_OWNER_ID`
- [ ] live-verify the IANEO Worker
- [ ] attach `ianeo.drthorne.uk` Custom Domain after the Worker exists
- [ ] register Telegram webhook only after the production URL is verified
- [ ] verify `/start`, `/status`, and FAQ health end to end

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

Cloudflare-side verification reported on 2026-08-21:

- `faq.drthorne.uk` was unused before assignment
- it is now attached as a Custom Domain to `school-of-nursing-faq-bot`
- existing workers.dev exposure remains enabled
- `GET https://faq.drthorne.uk/health` returned HTTP 200 with `ok: true`, service `school-of-nursing-faq-bot`, environment `production`

Decision: `https://faq.drthorne.uk` is the canonical production `FAQ_SERVICE_URL`. This preserves the direct HTTPS adapter architecture and avoids coupling the first adapter to a Cloudflare Service Binding.

The FAQ Telegram webhook is not treated as a service-control API. v0.1 exposes only the existing health capability. If richer FAQ control is needed later, assess the smallest authenticated `/internal/v1/...` bridge rather than refactoring the bot.

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

PR #1 previously produced successful GitHub Actions CI runs that installed dependencies and completed TypeScript type-checking. The deployment-configuration update changes `wrangler.toml` and documentation only, so the final PR head must still receive/confirm the targeted CI result before merge.

## Production state

**IANEO is not deployed yet.** No `ianeo-orchestrator` production Worker, Telegram webhook, or live FAQ-through-IANEO path has been verified.

Cloudflare-side readiness reported on 2026-08-21:

- `faq.drthorne.uk` attached and production health verified
- `ianeo.drthorne.uk` currently unused/available for later attachment
- no manually-created empty IANEO Worker is needed; first Wrangler deploy can create it
- initial deployment token permission can remain scoped to Account → Workers Scripts → Edit when the custom domain is attached later through the dashboard

GitHub deployment credentials are reported configured by the user. Their secret values are never read or stored in the repository.

## Next planned slice

Finish v0.1 production deployment and live verification before adding another integration:

1. confirm final PR-head targeted CI is green;
2. merge PR #1 to `main`;
3. observe the main-branch Wrangler deployment and verify `ianeo-orchestrator` is created;
4. configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` as Cloudflare Worker secrets;
5. configure `TELEGRAM_OWNER_ID` as a dashboard-managed plaintext variable;
6. verify the Worker health endpoint on its initial production hostname;
7. attach `ianeo.drthorne.uk` as the Custom Domain and verify it;
8. register the Telegram webhook against the verified production URL;
9. verify owner-only `/start`, `/status`, and FAQ health through IANEO;
10. reconcile both continuity docs against verified live evidence.

After v0.1 is live, choose between a genuinely useful richer FAQ backend surface or a separately authorized minimum Observer bridge. Do not add integrations merely for breadth.
