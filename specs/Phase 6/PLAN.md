# Phase 6 — Places: Implementation Plan

## Spec Groups

### Group A: Spec 6.1 — Places

**Tasks:**

- [x] Create `server/src/db/place.rs` — Place, PlaceInput structs + CRUD + search(query) function
- [x] Add `pub mod place` to `server/src/db/mod.rs`
- [x] Update `server/src/db/event.rs` — add `place_handle` field to EventInput; update create/update SQL to set place_handle
- [x] Add Candid API: `list_places`, `get_place`, `search_places`, `create_place`, `update_place`, `delete_place`
- [x] Update `server/server.did` with Place type and new methods
- [x] Update `src/declarations/` with Place types and methods
- [x] Create `src/routes/places/index.tsx` — place list
- [x] Create `src/routes/places/new.tsx` — new place form
- [x] Create `src/routes/places/$handle.tsx` — place detail with edit/delete
- [x] Update `src/components/EventForm.tsx` — replace place_text with place picker (search + select)
- [x] Update `src/routes/__root.tsx` nav — add Places link

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

When done, run: `openclaw system event --text "Done: icp-gramps Phase 6 session complete — see SESSION.md" --mode now`
