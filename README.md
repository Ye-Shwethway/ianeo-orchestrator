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
   +-- Outline Manager
   +-- URL Uploader
   +-- School of Nursing FAQ Bot
   +-- Observer Sandbox
   +-- GitHub
   +-- Cloudflare
   +-- future services
```

Interactive runtime communication is direct HTTPS/API communication. GitHub Actions are never used as the interactive integration bus.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full architecture contract.

## v0.1 foundation

The bootstrap Worker currently provides:

- Telegram webhook ingress
- webhook-secret verification
- owner-only access
- `/start`
- `/status`
- minimal adapter interface and registry
- targeted CI
- Wrangler deployment workflow structure

No external service adapter is connected yet. The first adapter will be selected after read-only inspection of candidate service repositories.

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

## Runtime secrets

Cloudflare Worker secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_OWNER_ID`

Future integrations should use service-specific secrets rather than a shared master token.

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

The initial Worker may use its `workers.dev` hostname. `ianeo.drthorne.uk` can be added later without changing the adapter architecture.

## Continuity

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living project documents. See `AGENTS.md` for the permanent synchronization rule and source-of-truth order.
