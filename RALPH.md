# Building icp-gramps with the RALPH Loop

This project is built using the **RALPH loop** technique — AI-assisted development with clean, focused context windows.

## What is a RALPH loop?

See [ghuntley.com/loop](https://ghuntley.com/loop) and [ic-asset-router/RALPH.md](https://github.com/kristoferlund/ic-asset-router/blob/main/RALPH.md) for a full explanation.

Short version: write detailed specs → generate a plan → feed one spec at a time to an AI coding agent in a loop.

## Workflow

### 1. Write specs
Each feature is a self-contained markdown file in `specs/Phase N/`.

### 2. Generate a plan
Feed the specs folder to the AI with the Generate Implementation Plan prompt (see `specs/Generate Implementation Plan — Prompt.md`).

### 3. Run the loop
```bash
./loop.sh PROMPT.md
```
Each iteration: agent reads `PLAN.md`, finds the next incomplete spec group, implements it, verifies (`cargo check` / `cargo test`), marks tasks done, commits, and stops.

## Phases

| Phase | Focus | Status |
|-------|-------|--------|
| [Phase 1](specs/Phase%201/PLAN.md) | **Bootstrap** — project scaffold, migrations, ic-asset-router wiring, React skeleton | 🔲 |
| Phase 2 | **Person Backend** — Person CRUD via Candid API + HTTP JSON routes | 🔲 |
| Phase 3 | **Person Frontend** — Person list, detail, add/edit forms | 🔲 |
| Phase 4 | **Events** — Birth/death events linked to persons | 🔲 |
| Phase 5 | **Families** — Father/mother/children relationships | 🔲 |
| Phase 6 | **Places** — Geographic locations linked to events | 🔲 |
| Phase 7 | **Search** — Full-text search (FTS5) across persons | 🔲 |
| Phase 8 | **Pedigree Chart** — Ancestor tree visualization | 🔲 |
