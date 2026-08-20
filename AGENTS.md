# AGENTS.md — IANEO Orchestrator

## Project Operating Rule

This repository is developed as a continuity-first project. Repository state and canonical documentation are authoritative over remembered chat context.

### Mandatory continuity documents

The repository root MUST always contain both:

- `ROADMAP.md`
- `NEW_CHAT_BOOTSTRAP.md`

These files are not optional notes. They are part of the project's operating contract.

### Continuous documentation rule

**After every meaningful implementation, architecture, workflow, deployment, integration, behavior, or project-state change, update `ROADMAP.md` and `NEW_CHAT_BOOTSTRAP.md` in the same development slice before considering the work complete.**

Do not allow either document to drift behind the actual repository state.

- `ROADMAP.md` records the durable plan, completed milestones, current phase, pending work, major decisions, and next intended slices.
- `NEW_CHAT_BOOTSTRAP.md` records the concise current truth needed for a fresh chat/session to resume work safely and accurately.
- If a change affects only one document directly, still review the other and update it when needed so both remain mutually consistent.
- A feature or development slice is not complete until continuity docs have been reconciled with the resulting repository state.
- When repository evidence conflicts with remembered conversation context, prefer the newer verified repository state and update the continuity docs accordingly.

## New-chat reconciliation

At the start of a fresh development chat/session:

1. Read `AGENTS.md`.
2. Read `NEW_CHAT_BOOTSTRAP.md`.
3. Read `ROADMAP.md`.
4. Read task-relevant canonical docs or source files referenced by them.
5. Reconcile remembered context against the repository before making changes.

Do not begin implementation from chat memory alone.

## Development principles

- Prefer small, runnable, reviewable slices.
- Avoid unnecessary over-engineering.
- Keep architecture and folder structure understandable to a human maintainer.
- Preserve explicit project decisions unless intentionally superseded and documented.
- Treat verified repository/runtime evidence as stronger than stale narrative summaries.
- Keep commits scoped and descriptive.

## Definition of done

A meaningful development slice is complete only when:

1. The intended code/config/docs change is finished.
2. Relevant verification has been performed.
3. `ROADMAP.md` reflects the new durable project state.
4. `NEW_CHAT_BOOTSTRAP.md` reflects the new resumable checkpoint.
5. The two continuity documents agree with each other and with the repository.
