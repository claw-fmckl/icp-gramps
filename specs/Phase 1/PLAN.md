# Phase 1 — Bootstrap: Implementation Plan

**Goal:** A fully deployable skeleton with empty pages, correct build pipeline, and database schema.

## Dependency Order

```
1.1 (Scaffold) → 1.4 (React) → 1.2 (Schema) → 1.3 (Wiring)
```

Rationale:
- Scaffold first: all config files and directory structure
- React next: so `dist/` exists for the Rust canister's `include_str!`
- Schema: pure SQL, no dependencies
- Wiring last: needs routes dir, migrations, and dist to exist

## Spec Groups

---

### Group A: Spec 1.1 — Project Scaffold

**Tasks:**

- [ ] Create `dfx.json` (see spec for exact content)
- [ ] Create workspace `Cargo.toml`
- [ ] Create `server/` directory tree: `src/lib.rs`, `src/db/mod.rs`, `src/routes/mod.rs`, `src/routes/index.rs`, `src/migrations/`
- [ ] Create `server/Cargo.toml` with correct dependencies (check crates.io for latest versions of ic-asset-router, ic-rusqlite, ic-sql-migrate)
- [ ] Create `server/build.rs`
- [ ] Create `server/server.did`
- [ ] Create `package.json`
- [ ] Create `vite.config.ts`
- [ ] Create `tsconfig.json`
- [ ] Create `tailwind.config.ts`
- [ ] Create `postcss.config.js`
- [ ] Create `index.html`
- [ ] Create `.gitignore` (node_modules, dist, target, .dfx, .env, Cargo.lock should NOT be ignored for workspace)

**Verification:**
```bash
cargo check -p server  # (will fail without migrations, that's OK at this point)
```

**Session boundary:** Commit after this group.

---

### Group B: Spec 1.4 — React Frontend Skeleton

**Tasks:**

- [ ] Create `src/main.tsx`
- [ ] Create `src/index.css` (Tailwind imports)
- [ ] Create `src/vite-env.d.ts`
- [ ] Create `src/routes/__root.tsx` (layout with nav)
- [ ] Create `src/routes/index.tsx` (home page with stat cards)
- [ ] Run `pnpm install` to generate `pnpm-lock.yaml`

**Verification:**
```bash
pnpm run build    # must produce dist/index.html
tsc --noEmit      # no TypeScript errors
```

**Session boundary:** Commit after this group.

---

### Group C: Spec 1.2 — Database Schema

**Tasks:**

- [ ] Create `server/src/migrations/001_initial.sql` (full schema from spec)
- [ ] Verify SQL syntax: `sqlite3 :memory: '.read server/src/migrations/001_initial.sql'`

**Verification:**
```bash
sqlite3 :memory: '.read server/src/migrations/001_initial.sql'  # no errors
```

**Session boundary:** Commit after this group.

---

### Group D: Spec 1.3 — Canister Wiring

**Tasks:**

- [ ] Implement `server/src/lib.rs` (init, pre_upgrade, post_upgrade, http_request, http_request_update)
- [ ] Implement `server/src/routes/index.rs` (GET / handler serving index.html)
- [ ] Implement `server/src/routes/mod.rs`
- [ ] Implement `server/src/db/mod.rs` (empty module)

**Verification:**
```bash
pnpm run build              # ensure dist/ is fresh
cargo check -p server       # must pass
```

**Session boundary:** Commit after this group.

---

## Verification Protocol (end of phase)

```bash
pnpm run build                                             # React builds
cargo check -p server                                      # Rust compiles
```

Optional (if dfx and wasi2ic are available):
```bash
dfx start --clean --background
dfx deploy
# Open http://<canister-id>.localhost:4943/ in browser
# Should see "Welcome to icp-gramps" homepage
dfx stop
```

## Session Prompt Template

```
Read the implementation plan at:
  ~/gh/icp-gramps/specs/Phase 1/PLAN.md

Find the first spec group that has incomplete tasks (unchecked `- [ ]` items).
Read the corresponding spec file in:
  ~/gh/icp-gramps/specs/Phase 1/

Study the relevant source files in the target codebase at:
  ~/gh/icp-gramps/

Read SESSION.md in the same directory as PLAN.md if it exists, for notes from previous sessions.

Then implement the tasks for that ONE spec group, in order. Follow these rules:

1. Implement tasks sequentially — no skipping, no reordering.
2. After each task, run the verification command.
3. Mark each task complete in PLAN.md (`- [x]`) as you finish it.
4. If verification fails, fix the issue and retry. If it fails twice on the same task, mark it with `- [!]` in PLAN.md, git commit partial work, and STOP.
5. Only modify files in the target codebase (~/gh/icp-gramps/), PLAN.md, and SESSION.md.
6. When all tasks in the spec group are done, run the group verification commands.
7. Git commit all changes with a descriptive message.
8. APPEND a session summary to the END of SESSION.md (do NOT overwrite). Use heading `## Session N: Spec X.Y — <title>`. Include: what was accomplished, obstacles, out-of-scope observations.
9. STOP. Do not continue to the next spec group.

When completely finished with the session, run:
openclaw system event --text "Done: icp-gramps Phase 1 session complete" --mode now
```
