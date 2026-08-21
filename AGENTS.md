# AGENTS.md — IANEO Orchestrator

IANEO Orchestrator is a lightweight personal Telegram command center. Keep the architecture small, direct, and easy to operate.

## Core invariants

- Existing bots and services remain independent projects. Do not merge their codebases into this repository.
- Runtime orchestration uses direct service-to-service HTTPS/API calls through service-specific adapters.
- Do not use Telegram bot-to-bot messaging as the integration bus.
- GitHub Actions may be used for CI, validation, deployment, and Wrangler publishing only. Never place GitHub Actions in the interactive bot-to-bot request path.
- Prefer configurable service URLs over hard-coded hosts, IPs, or deployment locations.
- Prefer one credential per integration. Do not introduce a shared global master service token.
- Never commit secrets, sensitive IDs, credentials, tokens, passwords, private `.env` values, or sensitive logs. This repository is public.
- Keep existing-service modifications minimal. Inspect for a usable API first; if none exists, prefer the smallest bridge over a refactor.

## Production deployment invariant

Normal production delivery is always:

`branch -> PR -> targeted CI green -> merge to main -> automatic Deploy Production workflow -> Wrangler -> Cloudflare Worker`

- Any merge to `main` must automatically trigger the production deployment workflow.
- Do not treat a PR merge as complete until the resulting production deploy has been checked.
- Manual deployment is an exception/recovery path only, not the normal release workflow.
- Keep the automatic main-branch deployment path working when modifying CI, Wrangler, package runtime requirements, or repository workflows.
- A successful CI run is not evidence of a successful production deployment; verify the deployment workflow separately.

## Engineering style

- Build small, versioned, runnable slices.
- Prefer minimal architecture and human-readable folders.
- Avoid speculative frameworks, premature multi-agent design, microservice machinery, queues, Durable Objects, databases, or AI routing unless a proven requirement needs them.
- Use targeted validation that protects the current slice; do not add broad test bureaucracy that slows iteration without value.
- Sensitive/destructive control actions must require explicit confirmation at the UX layer when introduced.

## Mandatory continuity rule

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both files in the same work cycle before the work is considered complete.

A feature or infrastructure change is not complete if repository continuity documentation is stale.

Before ending any substantial development session or merging a meaningful implementation PR, reconcile `ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` against the actual repository and verified runtime state.

This requirement is permanent. Documentation synchronization is not optional cleanup.

## Reconciliation source order

When sources conflict, prefer them in this order:

1. verified live/runtime evidence
2. current repository implementation
3. `NEW_CHAT_BOOTSTRAP.md`
4. `ROADMAP.md`
5. supporting architecture docs
6. remembered chat context

## New-chat read order

1. Read `AGENTS.md`.
2. Read `NEW_CHAT_BOOTSTRAP.md`.
3. Read `ROADMAP.md`.
4. Read task-relevant canonical docs and source files.
5. Reconcile before changing code or infrastructure.
