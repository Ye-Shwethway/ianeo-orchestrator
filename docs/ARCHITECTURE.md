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
   +-- OutlineAdapter --------> Outline Manager service
   +-- UploaderAdapter -------> URL Uploader service
   +-- FAQAdapter ------------> FAQ service
   +-- SandboxAdapter --------> Observer Sandbox service
   +-- GitHubAdapter ---------> GitHub API
   +-- CloudflareAdapter -----> Cloudflare API
```

The diagram is a target shape. v0.1 does not implement all adapters.

## Runtime path

Interactive requests use direct service-to-service communication:

```text
Telegram -> IANEO Worker -> adapter -> HTTPS/API -> target service
```

### Explicitly prohibited runtime paths

Do not use:

```text
IANEO -> GitHub Actions -> target service
```

or:

```text
IANEO Telegram bot -> Telegram command to another bot -> scrape response
```

GitHub Actions are reserved for CI, validation, deployment, and Wrangler publishing.

## Hosting and deployment

IANEO is a separate TypeScript Cloudflare Worker.

Deployment model:

```text
GitHub repository
   -> GitHub Actions
   -> Wrangler
   -> Cloudflare Worker
```

The first deployable version may use `workers.dev`. A later custom route such as `ianeo.drthorne.uk` is optional.

The Orchestrator must remain separate from the School of Nursing FAQ Worker.

## Network model

Services are distributed across different hosts and runtimes. Known examples include VPS-hosted services and Cloudflare Workers.

Adapters therefore depend on configurable service URLs rather than physical IPs or assumed co-location.

Potential stable hostnames may later include:

- `ianeo.drthorne.uk`
- `outline.drthorne.uk`
- `upload.drthorne.uk`
- `faq.drthorne.uk`
- `sandbox.drthorne.uk`

These are not prerequisites for v0.1.

## Adapter contract

The orchestration core should work with a small normalized contract:

```ts
interface ServiceAdapter {
  readonly id: string;
  getCapabilities(): Promise<Capability[]>;
  health(): Promise<HealthResult>;
  status(): Promise<StatusResult>;
  execute(action: string, params?: Record<string, unknown>): Promise<ExecutionResult>;
}
```

This contract is internal to IANEO. Target services do not need to implement matching REST endpoints.

Each adapter translates between IANEO's normalized model and the service's real interface.

## Existing-service integration policy

Before changing any existing bot repository, inspect whether it already exposes a usable callable surface:

- HTTP endpoints
- backend API
- RPC/service interface
- queue consumer
- callable service functions
- internal/admin web routes
- health/status endpoints

If a usable interface exists, integrate without code changes.

If none exists, prefer a tiny authenticated bridge such as an internal status/action endpoint. Do not refactor an entire bot solely to fit IANEO.

## Authentication

v0.1 uses a simple baseline:

```text
HTTPS + service-specific bearer token
```

Each integration should have its own credential where practical. Do not introduce a universal master token shared by all services.

More advanced mechanisms such as Cloudflare Access may be considered later only if operational need justifies them.

## Secret domains

### GitHub Actions Secrets

Deployment only:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Cloudflare Worker Secrets

Runtime only:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_OWNER_ID`
- future service-specific tokens

The public repository contains names/placeholders only, never values.

## Telegram ingress

v0.1 is deterministic and owner-only.

Supported commands:

- `/start`
- `/status`

The Worker verifies Telegram's webhook secret header and then verifies the sender against the configured owner ID before processing commands.

Natural-language/AI intent routing is intentionally deferred.

## Action safety model

Future actions are classified as:

### Read

Examples: health, status, logs, stats, list.

### Normal write

Examples: create outline, submit URL, update supported content.

### Sensitive control

Examples: deploy, restart, pause, resume, delete, destructive administration.

Sensitive control actions require explicit confirmation in the Telegram UX when introduced.

## Resource discipline

The project is personal-use infrastructure. Keep it lightweight.

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

The baseline remains:

```text
Cloudflare Worker + Telegram + adapters + HTTPS + secrets
```

## First-integration selection

After v0.1 bootstrap, inspect two contrasting existing systems read-only, preferably Observer Sandbox and School of Nursing FAQ Bot.

Compare:

- hosting model
- runtime
- API surface
- Telegram handler structure
- business/service separation
- authentication
- database dependency
- health/admin endpoints
- minimum bridge required

Then select the smallest useful first adapter. Do not modify either candidate during reconnaissance without explicit authorization.
