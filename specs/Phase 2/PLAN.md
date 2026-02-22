# Phase 2 — Person Backend: Implementation Plan

**Goal:** Working Candid API + HTTP JSON endpoints for person CRUD.

## Dependency Order

2.1 (Person Backend) — single spec, all tasks sequential.

## Spec Groups

---

### Group A: Spec 2.1 — Person Backend

**Tasks:**

- [x] Add `hex` crate to `server/Cargo.toml`
- [x] Implement `server/src/db/mod.rs`: `new_handle()`, `next_gramps_id()`
- [x] Create `server/src/db/person.rs`: `Person` struct, `PersonInput` struct, `list()`, `get()`, `create()`, `update()`, `delete()`, `count()`
- [x] Declare `pub mod person` in `server/src/db/mod.rs`
- [x] Add Candid API functions to `server/src/lib.rs`: `list_persons`, `get_person`, `create_person`, `update_person`, `delete_person`
- [x] Create `server/src/routes/api/` directory
- [x] Create `server/src/routes/api/persons/index.rs` (GET list + POST create)
- [x] Create `server/src/routes/api/persons/_handle/index.rs` (GET one + PUT update + DELETE)
- [x] Update all `mod.rs` files to declare new modules
- [x] Update `server/server.did` with Person type and new methods

**Verification:**
```bash
cargo check -p server
```

**Session boundary:** Commit after this group.

---

## Verification Protocol (end of phase)

```bash
cargo check -p server
```

## Session Prompt Template

```
Read the implementation plan at:
  ~/gh/icp-gramps/specs/Phase 2/PLAN.md

Find the first spec group that has incomplete tasks (unchecked `- [ ]` items).
Read the corresponding spec file in:
  ~/gh/icp-gramps/specs/Phase 2/

Study the relevant source files at ~/gh/icp-gramps/
Read SESSION.md if it exists.

Implement tasks for that ONE spec group, mark tasks complete, run verification, commit, write SESSION.md summary, STOP.

When done, run: openclaw system event --text "Done: icp-gramps Phase 2 complete" --mode now
```
