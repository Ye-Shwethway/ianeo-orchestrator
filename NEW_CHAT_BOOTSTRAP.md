# IANEO Orchestrator — New Chat Bootstrap

Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.

## Mandatory reconciliation order
1. `AGENTS.md`
2. `NEW_CHAT_BOOTSTRAP.md`
3. `ROADMAP.md`
4. task-relevant source/docs

Verified runtime evidence wins over repository narrative; repository state wins over remembered chat context.

## Permanent rules

Continuity docs update after every meaningful implementation/integration/deployment/operational change.

Normal production delivery:

`branch -> PR -> targeted CI green -> merge main -> automatic Deploy Production -> Wrangler -> Cloudflare`

Manual deployment is recovery-only. Production deploy green is separate from CI green.

## Current live state — 2026-08-21

- IANEO: `https://ianeo.drthorne.uk`
- FAQ: `https://faq.drthorne.uk`
- Telegram webhook live
- layered Bots navigation live
- FAQ capability discovery + generic read actions live-tested through `cases.summary`
- user confirmed all current FAQ read capabilities work through IANEO
- matching service secrets are active on both Workers

## Scalable FAQ control architecture

FAQ exposes:
- `GET /internal/v1/capabilities`
- `GET /internal/v1/status`
- `POST /internal/v1/actions/<action-id>`

Current read capabilities:
- `operations.status`
- `monitoring.status`
- `handoff.status`
- `admins.summary`
- `cases.summary`

IANEO discovers this manifest dynamically. New remote-safe FAQ capabilities should normally require only a target-side registry/domain entry, not a bespoke HTTP endpoint + adapter method + Telegram callback for each Owner command.

## Active UX correction

User reported the current leaf-action behavior closes the menu immediately after showing a result. Required behavior is now locked as:

1. action result edits the same menu card;
2. result view keeps `⬅️ Back` and `✕ Close`;
3. Back returns to the relevant menu;
4. Close deletes immediately;
5. menu/result card auto-deletes after about **5 minutes of inactivity**;
6. any navigation/action resets the inactivity timer.

Branch: `feat/menu-result-back-ttl`

Implementation uses a minimal `MenuCleanup` Durable Object alarm because Cloudflare `waitUntil()` cannot reliably hold a five-minute post-response timer. No D1/KV/Queue was added.

Changed implementation:
- `src/telegram/menu-cleanup.ts` — per-card alarm scheduling/cancel
- `src/telegram/client.ts` — returns sent message ID for initial TTL scheduling
- `src/telegram/menu.ts` — FAQ/System result keyboards with Back + Close
- `src/telegram/handler.ts` — edit-in-place results and TTL reset on interaction
- `src/config/env.ts` — `MENU_CLEANUP` binding
- `src/index.ts` — exports Durable Object class
- `wrangler.toml` — Durable Object binding + first migration

## Validation boundary

Before merge:
- targeted TypeScript CI must pass.

After merge:
- automatic Deploy Production must succeed without manual deploy;
- `/start` card must stay usable;
- FAQ read result must stay visible with Back + Close;
- Back must restore FAQ capability menu;
- manual Close must delete immediately;
- untouched card must auto-delete after roughly five minutes;
- interacting before expiry must reset the five-minute window.

## Next control expansion

Once this UX correction is live-accepted, continue bounded write controls through the same dynamic capability registry. First candidates: monitoring mode and handoff route. Sensitive Owner functions remain deferred until target-side authorization/audit plus explicit confirmation are verified.

## One-line handoff

Current truth: FAQ dynamic read controls are live and working through IANEO; the active slice corrects result navigation so cards remain open with Back/Close and adds reliable five-minute inactivity auto-close using one minimal Durable Object alarm class.
