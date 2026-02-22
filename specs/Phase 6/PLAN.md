# Phase 6 — Places: Implementation Plan

## Spec Groups

### Group A: Spec 6.1 — Places

**Tasks:**

- [ ] Create `server/src/db/place.rs` — Place, PlaceInput structs + CRUD + search(query) function
- [ ] Add `pub mod place` to `server/src/db/mod.rs`
- [ ] Update `server/src/db/event.rs` — add `place_handle` field to EventInput; update create/update SQL to set place_handle
- [ ] Add Candid API: `list_places`, `get_place`, `search_places`, `create_place`, `update_place`, `delete_place`
- [ ] Update `server/server.did` with Place type and new methods
- [ ] Update `src/declarations/` with Place types and methods
- [ ] Create `src/routes/places/index.tsx` — place list
- [ ] Create `src/routes/places/new.tsx` — new place form
- [ ] Create `src/routes/places/$handle.tsx` — place detail with edit/delete
- [ ] Update `src/components/EventForm.tsx` — replace place_text with place picker (search + select)
- [ ] Update `src/routes/__root.tsx` nav — add Places link

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

When done, run: `openclaw system event --text "Done: icp-gramps Phase 6 session complete — see SESSION.md" --mode now`
