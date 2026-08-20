# IANEO Orchestrator — Roadmap

> Canonical durable roadmap for `Ye-Shwethway/ianeo-orchestrator`.
>
> This file MUST be reviewed and kept current after every meaningful project change. See `AGENTS.md`.

## Project intent

Build the IANEO Orchestrator as a small, maintainable orchestration layer that can coordinate IANEO workflows across connected services and development surfaces without burying the project in unnecessary infrastructure.

The repository is currently at its foundation/bootstrap stage. Detailed implementation architecture will be added as the first runnable slices are defined and verified.

## Operating principles

- Continuity-first development.
- Repository truth over remembered chat context.
- Small, runnable, reviewable implementation slices.
- Minimal architecture first; expand only when a real requirement justifies it.
- Explicit state, ownership, and failure handling for orchestrated work.
- No hidden divergence between implementation and documentation.

## Mandatory continuity contract

The root-level files below are permanent project infrastructure:

- `AGENTS.md`
- `ROADMAP.md`
- `NEW_CHAT_BOOTSTRAP.md`

### Required update rule

**Every meaningful implementation, architecture, integration, workflow, deployment, configuration, or project-state change must end with a reconciliation pass over both `ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md`.**

A slice is not considered complete while either continuity document is stale.

## Current phase

### Phase 0 — Repository foundation

Status: **IN PROGRESS**

Completed:

- [x] Create repository.
- [x] Establish high-level repository governance in `AGENTS.md`.
- [x] Establish `ROADMAP.md` as the durable planning source.
- [x] Establish `NEW_CHAT_BOOTSTRAP.md` as the fresh-session handoff source.
- [x] Make continuous maintenance of both continuity documents an explicit project rule.

Pending:

- [ ] Define the first minimum-runnable orchestrator architecture.
- [ ] Define the initial execution surface and deployment target.
- [ ] Define configuration/secrets boundaries.
- [ ] Define provider/connector adapters required by the first slice.
- [ ] Define observability and failure-reporting minimums.
- [ ] Implement and verify the first end-to-end orchestration path.

## Planned phases

### Phase 1 — Minimum runnable orchestrator

Goal: one complete, understandable orchestration path from request/input to delegated execution to returned result.

Scope will be finalized before implementation. Prefer the smallest architecture that proves the orchestration contract.

### Phase 2 — Reliability and state

Potential concerns, only after Phase 1 proves the need:

- durable job/state handling
- retry/idempotency rules
- execution history
- structured error reporting
- controlled concurrency

### Phase 3 — Expanded integrations

Add integrations only when they support concrete workflows. Avoid building a generic integration framework ahead of requirements.

### Phase 4 — Operational refinement

Possible later work:

- richer monitoring
- admin/operator controls
- scheduling or event-driven execution where justified
- deployment hardening
- cost/runtime optimization

## Decision log

### 2026-08-21 — Continuity docs are mandatory

Decision: `ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` are permanent root-level canonical files and must be kept synchronized with repository state after every meaningful development slice.

Reason: new chats/sessions must be able to resume from repository truth without relying on fragile conversational memory.

## Next authorized planning target

Define the **first minimum-runnable orchestrator slice** and document its architecture before code implementation.

Do not inflate the first slice into a broad platform. It should prove one real orchestration flow end to end.
