# IANEO Orchestrator

IANEO Orchestrator is a lightweight personal Telegram command center that provides one unified interface for controlling and accessing multiple existing bots and services.

It is a **control plane and adapter/facade layer**, not a monolithic replacement for those systems.

## Architecture

```text
Telegram
   |
   v
IANEO Orchestrator (Cloudflare Worker)
   |
   v
Adapter / Integration Layer
   +-- School of Nursing FAQ Bot (first read-only adapter)
   +-- Outline Manager
   +-- URL Uploader
   +-- Observer Sandbox
   +-- GitHub
   +-- Cloudflare
   +-- future services
```

Interactive runtime communication uses direct HTTPS/API calls. GitHub Actions are never used as the interactive integration bus, and IANEO does not control other bots by sending them Telegram commands.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full architecture contract.

## v0.1 foundation

The current branch provides:

- TypeScript Cloudflare Worker
- Telegram webhook ingress
- webhook-secret verification
- owner-only access
- `/start`
- `/status`
- normalized adapter interface and registry
- targeted CI
- Wrangler deployment workflow structure
- first real adapter: School of Nursing FAQ Bot read-only health check

The FAQ adapter calls the FAQ Worker's existing `GET /health` endpoint through direct HTTPS. The canonical non-secret production base URL is now:

```text
https://faq.drthorne.uk
```

Cloudflare-side verification reported that this Custom Domain is attached to the production `school-of-nursing-faq-bot` Worker and that `GET https://faq.drthorne.uk/health` returns the expected production health response. The FAQ repository itself was not modified.

Observer Sandbox was also inspected. Its current Python/SQLite runtime exposes local CLI control but no existing remote HTTP surface, so Observer integration is deferred until a separately authorized minimal bridge is designed.

## Local setup

Requirements:

- Node.js 20+
- npm
- Cloudflare account for deployment
- Telegram bot credentials for runtime testing

Install dependencies:

```bash
npm install
```

Type-check:

```bash
npm run typecheck
```

Run locally with Wrangler:

```bash
npm run dev
```

Copy `.dev.vars.example` to `.dev.vars` for local development and provide local values. Never commit `.dev.vars`.

## Runtime configuration

Cloudflare Worker secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

Dashboard-managed non-secret runtime variable:

- `TELEGRAM_OWNER_ID`

Wrangler-managed non-secret service configuration:

- `FAQ_SERVICE_URL = https://faq.drthorne.uk`

`wrangler.toml` uses `keep_vars = true` so dashboard-managed plaintext variables are preserved across deployments. Runtime secrets remain managed in Cloudflare and are not committed.

Future protected integrations should use service-specific secrets rather than a shared master token.

## Deployment secrets

GitHub Actions deployment secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are deployment credentials only. Runtime service credentials belong in Cloudflare Worker secrets.

## Deployment model

```text
development
   -> branch / PR
   -> merge to main
   -> GitHub Actions
   -> Wrangler
   -> IANEO Cloudflare Worker
```

The first deploy keeps the generated workers.dev hostname enabled for bootstrap verification. After the Worker exists, `ianeo.drthorne.uk` can be attached as the stable Custom Domain without changing the adapter architecture.

## Current state

PR #1 contains the v0.1 foundation and first FAQ health adapter. The user reports the two GitHub Actions deployment credentials are configured. FAQ Custom Domain readiness is established, but IANEO has **not yet been deployed or live-verified**. Final PR-head CI must pass before merge.

## Continuity

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living project documents. See `AGENTS.md` for the permanent synchronization rule and source-of-truth order.
