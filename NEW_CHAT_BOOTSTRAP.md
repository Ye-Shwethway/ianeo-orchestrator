# IANEO Orchestrator — New Chat Bootstrap

> Fresh-session continuity checkpoint for `Ye-Shwethway/ianeo-orchestrator`.
>
> This file MUST be reviewed and updated after every meaningful project change. See `AGENTS.md`.

## Read order for every new development chat

Before modifying code, configuration, workflows, deployment, or architecture:

1. Read `AGENTS.md`.
2. Read this file: `NEW_CHAT_BOOTSTRAP.md`.
3. Read `ROADMAP.md`.
4. Read the task-relevant canonical docs and source files referenced by those documents.
5. Reconcile remembered/chat context against the repository.

Repository state and newer verified evidence are authoritative over stale chat memory.

## Current checkpoint

Date: **2026-08-21**

Repository phase: **Phase 0 — Foundation / bootstrap**

Current state:

- Repository created and initially empty.
- `AGENTS.md` now defines the high-level operating and continuity rules.
- `ROADMAP.md` now defines the durable project plan and current phase.
- `NEW_CHAT_BOOTSTRAP.md` is established as the canonical fresh-session handoff.
- No orchestrator runtime or application implementation has been committed yet.
- The next target is to define the first minimum-runnable orchestration slice before implementation.

## Mandatory continuity rule

**Every meaningful implementation, architecture, workflow, deployment, integration, configuration, or project-state change MUST conclude with a review/reconciliation of both `ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md`.**

Do not mark a development slice complete while either file is stale.

If only one appears to need an edit, still review the other and confirm that both remain mutually consistent with the repository.

## Current project direction

Build a lightweight, maintainable IANEO orchestration layer using small runnable slices. Avoid speculative platform-building and unnecessary abstractions.

The first implementation slice should prove one real end-to-end orchestration flow with clear inputs, delegated execution, result handling, and visible failure behavior.

## Next-session procedure

A new chat should:

1. Perform reconciliation only first.
2. Summarize the current repository checkpoint.
3. Identify the next minimum-runnable slice from `ROADMAP.md`.
4. Inspect any task-relevant files before proposing implementation details.
5. Preserve the continuity contract throughout the work.
6. At the end of the slice, update `ROADMAP.md` and this file before declaring completion.

## Do not assume yet

Until explicitly designed and committed, do not assume:

- a specific runtime/framework
- a specific Cloudflare architecture
- a queue or durable state system
- a database
- a connector abstraction layer
- a scheduling model
- a production deployment topology

Choose these only when required by the first real orchestration workflow.

## Handoff sentence

**Current truth:** IANEO Orchestrator is at repository-foundation stage; continuity governance is established, no runtime implementation exists yet, and the next step is to define the first minimum-runnable orchestration slice.
