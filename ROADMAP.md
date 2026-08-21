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

Status: **MERGED TO MAIN — first deployment failed on Node runtime mismatch; Node 22 hotfix in progress**

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
- [x] GitHub deployment secrets reported configured by the user
- [x] PR #1 merged to `main`

Deployment incident — 2026-08-21:

- The first `Deploy Production` run reached `npm run deploy` and failed before Wrangler could deploy.
- Failure text: Wrangler requires Node.js `>=22.0.0`; workflow used Node `20.20.2`.
- This is a deployment-runner mismatch, not an application/typecheck failure.
- The run failed before a Cloudflare deployment request completed, so `ianeo-orchestrator` must still be treated as not created/unverified.
- Cloudflare credential validity was not proven by that run because Wrangler exited on the local Node-version guard first.
- Hotfix branch `fix/node22-deploy` changes CI and production deployment to Node 22 and declares `node >=22` in `package.json`.

Still pending:

- [ ] validate Node 22 hotfix CI
- [ ] merge hotfix to `main`
- [ ] observe successful Wrangler deployment/create `ianeo-orchestrator`
- [ ] verify GitHub Cloudflare deployment credentials through an actual deploy
- [ ] configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` in the Worker
- [ ] configure dashboard-managed `TELEGRAM_OWNER_ID`
- [ ] live-verify IANEO `/health`
- [ ] attach and verify `ianeo.drthorne.uk`
- [ ] register Telegram webhook
- [ ] verify owner-only `/start`, `/status`, and FAQ health end to end

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

**IANEO is not deployed or runtime-verified yet.**

PR #1 is merged. The first production deployment failed solely at Wrangler's Node-version prerequisite before Worker publication. Do not claim a Worker, custom domain, Telegram webhook, or FAQ-through-IANEO runtime until live evidence exists.

## Next planned slice

1. validate and merge the Node 22 deployment hotfix;
2. observe the resulting main-branch production deploy;
3. confirm `ianeo-orchestrator` creation and initial workers.dev health;
4. configure Telegram runtime secrets and owner ID;
5. attach `ianeo.drthorne.uk` and verify it;
6. register Telegram webhook;
7. verify `/start`, `/status`, and FAQ health end to end;
8. reconcile both continuity docs from verified runtime evidence.

After v0.1 is live, choose either a richer FAQ backend surface or a separately authorized minimum Observer bridge. Do not expand integrations merely for breadth.
