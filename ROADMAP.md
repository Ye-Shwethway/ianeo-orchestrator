# IANEO Orchestrator — Roadmap

Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.

`ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are mandatory living continuity documents. Every meaningful implementation, architecture, integration, deployment, operational-state, or roadmap change MUST update both in the same work cycle. A feature or infrastructure change is not complete while continuity documentation is stale.

## Project goal

Build **IANEO Orchestrator** as a lightweight personal Telegram command center over independent bots and services.

IANEO is the Telegram front door, control plane, adapter/facade layer, and capability router. Existing systems remain independent.

## Locked architecture

- Runtime: TypeScript Cloudflare Worker.
- Telegram ingress: webhook.
- Service integration: direct HTTPS/API through service-specific adapters.
- Deployment: `GitHub -> GitHub Actions -> Wrangler -> Cloudflare Worker`.
- GitHub Actions are CI/deployment only, never interactive runtime.
- Telegram bot-to-bot messaging is not the integration bus.
- Production FAQ endpoint: `https://faq.drthorne.uk`.
- Initial IANEO deployment keeps `workers.dev` enabled; `ianeo.drthorne.uk` is attached after the Worker exists.
- No unnecessary DB, queue, Durable Object, event bus, service mesh, or premature AI routing.

Interactive path:

`Telegram -> IANEO Worker -> adapter -> direct HTTPS/API -> target service`

### Production delivery invariant

Normal production delivery is:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

A main-branch merge must automatically trigger production deployment. Manual Wrangler deployment is recovery/exception only. Always verify the production deployment result separately from CI.

### Adapter contract

- `getCapabilities()`
- `health()`
- `status()`
- `execute(action, params)`

### Existing-service policy

Inspect callable surfaces first. Prefer zero-change integration. If none exists, add only the smallest authenticated bridge needed.

## Secrets and runtime configuration

Public repository: never commit real credentials or sensitive identifiers.

GitHub Actions deployment secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Worker runtime secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- future service-specific bearer tokens

Non-secret Worker configuration:

- `TELEGRAM_OWNER_ID` — dashboard-managed plaintext variable
- `FAQ_SERVICE_URL` — Wrangler-managed, currently `https://faq.drthorne.uk`

`wrangler.toml` uses `keep_vars = true` so dashboard-managed plaintext variables survive normal deploys.

## v0.1 — Deployable foundation + first real read path

Status: **DEPLOYED — runtime configuration entered; custom-domain/webhook live verification still pending**

Completed:

- [x] continuity governance and source-of-truth rules
- [x] TypeScript Cloudflare Worker foundation
- [x] Telegram webhook-secret verification
- [x] owner-only `/start` and `/status`
- [x] minimal adapter contract/registry
- [x] targeted CI
- [x] Wrangler production-deployment workflow
- [x] public-repository secret hygiene
- [x] read-only reconnaissance of FAQ Bot and Observer Sandbox
- [x] first adapter: School of Nursing FAQ Bot health
- [x] direct HTTPS `GET /health` through `FaqAdapter`
- [x] FAQ Custom Domain `faq.drthorne.uk` established and live-verified by Cloudflare-side evidence
- [x] canonical `FAQ_SERVICE_URL = https://faq.drthorne.uk`
- [x] `keep_vars = true`
- [x] GitHub deployment secrets configured by the user
- [x] PR #1 merged to `main`
- [x] first deployment failure isolated to Node 20 vs Wrangler Node >=22 requirement
- [x] Node 22 hotfix merged through PR #2
- [x] CI and production workflows now use Node 22
- [x] `package.json` declares `node >=22`
- [x] user reports manual production deployment completed successfully after the hotfix
- [x] user reports `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and `TELEGRAM_OWNER_ID` entered in Cloudflare runtime configuration
- [x] permanent rule added: merge to `main` must auto-deploy production

Deployment incident — 2026-08-21:

- Initial production deploy failed because workflow Node `20.20.2` did not satisfy Wrangler `^4.124.0` requirement of Node `>=22.0.0`.
- The targeted fix moved CI/deploy to Node 22 and declared the runtime floor in `package.json`.
- The hotfix CI passed and PR #2 merged.
- The user later manually deployed successfully and confirmed runtime bindings were entered.
- Treat the Worker as deployed from user-reported operational evidence, but custom-domain, health, Telegram webhook, and end-to-end command behavior still require explicit live verification.

Still pending:

- [ ] verify IANEO `/health` on the deployed Worker hostname
- [ ] attach `ianeo.drthorne.uk` to `ianeo-orchestrator`
- [ ] verify `GET https://ianeo.drthorne.uk/health`
- [ ] register Telegram webhook against `https://ianeo.drthorne.uk/telegram/webhook`
- [ ] verify webhook registration status
- [ ] verify owner-only `/start`
- [ ] verify `/status` and FAQ health through IANEO
- [ ] confirm future main merges auto-trigger `Deploy Production` without manual intervention
- [ ] reconcile continuity docs from final live evidence

Current toolchain/runtime floor:

- Node.js `>=22`
- `@cloudflare/workers-types` `^5.20260818.1`
- `typescript` `^7.0.2`
- `wrangler` `^4.124.0`

## First-adapter decision

### School of Nursing FAQ Bot — selected

Production FAQ Worker exposes existing `GET /health`. Cloudflare-side verification reported:

- `faq.drthorne.uk` attached as a Custom Domain to `school-of-nursing-faq-bot`
- workers.dev remains enabled
- `GET https://faq.drthorne.uk/health` -> HTTP 200
- response identifies service `school-of-nursing-faq-bot`, environment `production`, `ok: true`

Decision: use `https://faq.drthorne.uk` as canonical production `FAQ_SERVICE_URL`. This preserves direct HTTPS and avoids a Service Binding for the first adapter.

### Observer Sandbox — deferred

Observer is a Python/SQLite runtime with local `sandboxctl` control and no existing remote HTTP surface found during reconnaissance. Remote integration requires a separately authorized minimal authenticated bridge.

## Production state

IANEO Worker deployment is reported successful and Telegram runtime bindings are reported configured. The project is **not yet end-to-end live-verified** because the stable IANEO Custom Domain and Telegram webhook are not yet verified.

## Next planned slice

1. verify the deployed IANEO Worker `/health`;
2. attach `ianeo.drthorne.uk` as Custom Domain;
3. verify `https://ianeo.drthorne.uk/health`;
4. register Telegram webhook using the configured webhook secret;
5. verify owner-only `/start` and `/status`;
6. verify FAQ health through IANEO direct HTTPS;
7. confirm automatic main-merge deployment behavior on the next production change;
8. reconcile both continuity docs from verified live evidence.

After v0.1 is live, choose either a richer FAQ backend surface or a separately authorized minimum Observer bridge. Do not expand integrations merely for breadth.
