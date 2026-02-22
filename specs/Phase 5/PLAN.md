# Phase 5 — Families: Implementation Plan

**Goal:** Family units with father/mother/children, linked to person detail page.

## Spec Groups

---

### Group A: Spec 5.1 — Families

**Tasks:**

- [ ] Create `server/src/db/family.rs` — Family, FamilyChild, FamilyInput structs + CRUD + relationship queries
- [ ] Add `pub mod family` to `server/src/db/mod.rs`
- [ ] Add Candid API to `server/src/lib.rs`: list_families, get_family, create_family, update_family, delete_family, add_child_to_family, remove_child_from_family, get_family_children, get_person_parent_families, get_person_own_families
- [ ] Update `server/server.did` with Family type and new methods
- [ ] Update `src/declarations/` with Family type and new methods
- [ ] Create `src/routes/families/index.tsx` — family list
- [ ] Create `src/routes/families/new.tsx` — create family form
- [ ] Create `src/routes/families/$handle.tsx` — family detail (father, mother, children)
- [ ] Update `src/routes/persons/$handle.tsx` — add Parents and Families sections
- [ ] Update `src/routes/__root.tsx` nav — add Families link

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

**Session boundary:** Commit after this group.

---

When done, run: `openclaw system event --text "Done: icp-gramps Phase 5 session complete — see SESSION.md" --mode now`
