# Phase 4 — Events: Implementation Plan

**Goal:** Birth and death events linked to persons, displayed on the person detail page.

## Spec Groups

---

### Group A: Spec 4.1 — Events

**Tasks:**

- [ ] Create `server/src/migrations/002_event_place_text.sql` — adds `place_text TEXT` column to event table
- [ ] Create `server/src/db/event.rs` — Event struct, EventInput struct, create/get/update/delete functions
- [ ] Add `pub mod event` to `server/src/db/mod.rs`
- [ ] Add `get_birth_event` / `get_death_event` / `set_birth_event` / `set_death_event` helpers to `server/src/db/person.rs`
- [ ] Add Candid API to `server/src/lib.rs`: `create_event`, `update_event`, `delete_event`, `get_event`, `set_person_birth`, `set_person_death`, `get_person_birth`, `get_person_death`
- [ ] Update `server/server.did` with Event type and new methods
- [ ] Update `src/declarations/` with Event type and new Candid methods
- [ ] Create `src/components/EventForm.tsx` — reusable date_text/place_text/description form
- [ ] Update `src/routes/persons/$handle.tsx` — fetch and display birth/death; show EventForm for add/edit

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

**Session boundary:** Commit after this group.

---

## Verification Protocol

```bash
pnpm run build
tsc --noEmit
```

When done, run: `openclaw system event --text "Done: icp-gramps Phase 4 session complete — see SESSION.md" --mode now`
