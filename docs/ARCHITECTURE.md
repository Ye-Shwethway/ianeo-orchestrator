# IANEO Orchestrator Architecture

## Purpose

IANEO Orchestrator is a lightweight personal control plane exposed through Telegram. It unifies access to independent bots and services without merging their repositories or forcing them into one runtime architecture.

## System shape

```text
Telegram
   |
   | webhook
   v
IANEO Orchestrator — Cloudflare Worker
   |
   | capability routing
   v
Adapter Registry
   +-- FAQAdapter ------------> School of Nursing FAQ Worker
   +-- OutlineAdapter --------> Outline Manager service       (future)
   +-- UploaderAdapter -------> URL Uploader service          (future)
   +-- SandboxAdapter --------> Observer Sandbox bridge       (future)
   +-- GitHubAdapter ---------> GitHub API                    (future)
   +-- CloudflareAdapter -----> Cloudflare API                (future)
```

Only the FAQ read-only health adapter is implemented in v0.1. The other lines are target architecture, not current production claims.

## Runtime path

Interactive requests use direct service-to-service communication:

```text
Telegram -> IANEO Worker -> adapter -> HTTPS/API -> target service
```

Explicitly prohibited runtime paths:

```text
IANEO -> GitHub Actions -> target service
```

and:

```text
IANEO Telegram bot -> Telegram command to another bot -> scrape response
```

GitHub Actions are reserved for CI, validation, deployment, and Wrangler publishing.

## Hosting and deployment

IANEO is a separate TypeScript Cloudflare Worker.

```text
GitHub repository
   -> GitHub Actions
   -> Wrangler
   -> Cloudflare Worker
```

The first deployment keeps the generated `workers.dev` hostname enabled for bootstrap verification. `ianeo.drthorne.uk` is reserved as the stable production Custom Domain and is attached after the first successful deploy creates the Worker.

IANEO remains separate from the School of Nursing FAQ Worker.

## Network model

Services are distributed across different hosts and runtimes. Adapters therefore depend on configurable service URLs rather than physical IPs or assumed co-location.

The first production target uses the verified Custom Domain:

```text
IANEO Worker -> https://faq.drthorne.uk -> School of Nursing FAQ Worker
```

The FAQ Custom Domain is intentional: Cloudflare Custom Domains can be invoked from another Worker in the same zone via normal `fetch()`, preserving the canonical direct-HTTPS architecture without introducing a Service Binding for this adapter.

Future stable hostnames may include `ianeo.drthorne.uk`, `outline.drthorne.uk`, `upload.drthorne.uk`, and `sandbox.drthorne.uk` as integrations become real. Do not allocate domains merely for speculative breadth.

## Adapter contract

IANEO uses a deliberately small internal contract:

```ts
interface ServiceAdapter {
  readonly id: string;
  getCapabilities(): Promise<Capability[]>;
  health(): Promise<HealthResult>;
  status(): Promise<StatusResult>;
  execute(action: string, params?: Record<string, unknown>): Promise<ExecutionResult>;
}
```

Target services do not need matching REST endpoints. Each adapter translates between this normalized model and the target's real interface.

## Existing-service integration policy

Before changing an existing bot repository, inspect whether it already exposes a usable callable surface such as HTTP endpoints, backend APIs, RPC/service interfaces, queues, callable service functions, internal/admin routes, or health/status endpoints.

If a usable interface exists, integrate without code changes. If none exists, prefer a tiny authenticated bridge. Do not refactor an entire bot solely to fit IANEO.

## First adapter decision

### School of Nursing FAQ Bot

Read-only repository reconnaissance confirmed the FAQ bot is already an HTTP-native TypeScript Cloudflare Worker and exposes:

```text
GET  /health
POST /telegram/webhook
```

The health response contains `ok`, service identity, and environment. Therefore v0.1 uses a `FaqAdapter` that calls the existing `GET /health` directly.

```text
IANEO Worker
   -> FaqAdapter
   -> GET https://faq.drthorne.uk/health
   -> FAQ Worker
```

Cloudflare-side verification reported on 2026-08-21 that `faq.drthorne.uk` was attached to `school-of-nursing-faq-bot` and `GET /health` returned HTTP 200 with `ok: true`, service `school-of-nursing-faq-bot`, and environment `production`. The existing workers.dev URL remains enabled.

This integration requires **zero code changes** to the FAQ repository. `FAQ_SERVICE_URL` is non-secret and committed in Wrangler configuration as `https://faq.drthorne.uk`.

The FAQ Telegram webhook is explicitly **not** treated as a service-control API. v0.1 exposes only the read-only health capability. If richer control is later justified, prefer a tiny dedicated authenticated internal endpoint rather than abusing Telegram ingress or refactoring the FAQ application.

### Observer Sandbox

Read-only reconnaissance confirmed Observer is currently a Python 3.11+ package with the CLI entry point:

```text
sandboxctl = observer_sandbox.cli:main
```

Status, autonomy, and Creator control operations are exposed through local Python/SQLite-backed runtime paths. The project declares no HTTP server framework dependency and no existing remote HTTP control surface was found during inspection.

Therefore an IANEO `SandboxAdapter` is deferred. Remote integration would require a separately authorized minimal authenticated bridge or equivalent remote callable surface on the Observer host. Existing Observer runtime/domain code should remain intact behind that bridge.

This contrast is intentional evidence that the adapter model works across heterogeneous systems: FAQ uses an existing HTTP surface; Observer can later use a small bridge without forcing either backend into a shared architecture.

## Authentication

Baseline for protected integrations:

```text
HTTPS + service-specific bearer token
```

Each integration should have its own credential where practical. Do not introduce a universal master token.

The current FAQ `/health` integration is read-only and uses the target's already exposed health endpoint, so it does not invent a credential requirement the target does not currently have. Any future protected FAQ actions should use a dedicated service credential.

More advanced mechanisms such as Cloudflare Access may be considered later only if operational need justifies them.

## Configuration and secret domains

### GitHub Actions Secrets

Deployment only:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These values are configured out of band and never committed.

### Cloudflare Worker Secrets

Runtime credentials:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- future service-specific tokens

### Non-secret runtime configuration

- `FAQ_SERVICE_URL` — Wrangler-managed, canonical value `https://faq.drthorne.uk`
- `TELEGRAM_OWNER_ID` — dashboard-managed plaintext variable
- future non-secret service base URLs

`wrangler.toml` sets `keep_vars = true`, allowing dashboard-managed plaintext variables such as `TELEGRAM_OWNER_ID` to remain present across deployments while repository-managed variables remain explicit source configuration. Normal Wrangler deployment does not delete existing secrets.

## Telegram ingress

v0.1 is deterministic and owner-only.

Supported commands:

- `/start`
- `/status`

The Worker verifies Telegram's webhook secret header and sender owner ID before processing commands. `/status` queries configured adapters and currently can show the FAQ health result.

Natural-language/AI intent routing is intentionally deferred.

## Action safety model

Future actions are classified as Read, Normal Write, or Sensitive Control. Sensitive actions such as deploy, restart, pause, resume, delete, or destructive administration require explicit confirmation in the Telegram UX when introduced.

## Resource discipline

Do not introduce without a concrete requirement:

- database
- Durable Objects
- queues
- event bus
- microservice framework
- service mesh
- Kubernetes
- generic plugin platform
- multi-agent orchestration
- AI intent routing

Baseline remains:

```text
Cloudflare Worker + Telegram + adapters + HTTPS + secrets
```

## Current verification boundary

The FAQ Custom Domain and its health endpoint have been reported live-verified on Cloudflare. IANEO itself is **not yet production-verified**. PR #1 must pass final targeted CI, merge to `main`, deploy through Wrangler, receive its Telegram runtime configuration, then be verified end to end before production success is claimed.
