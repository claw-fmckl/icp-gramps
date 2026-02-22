# Phase 6 — Search: Implementation Plan

**Goal:** FTS5-powered person name search with results page and nav search bar.

## Spec Groups

---

### Group A: Spec 6.1 — Search

**Tasks:**

- [ ] Add `fts_upsert(conn, person_handle, full_name)` and `fts_delete(conn, person_handle)` helpers to `server/src/db/person.rs`
- [ ] Hook `fts_upsert` into `Person::create` and `Person::update`
- [ ] Hook `fts_delete` into `Person::delete`
- [ ] Add `Person::search(query) -> Vec<Person>` function using FTS5 MATCH with prefix `*`
- [ ] Add `search_persons(query: String) -> Vec<Person>` Candid query to `server/src/lib.rs`
- [ ] Create `server/src/routes/api/search.rs` — GET /api/search?q= HTTP route
- [ ] Update `server/server.did` with `search_persons` method
- [ ] Update `src/declarations/` with `search_persons`
- [ ] Create `src/components/SearchBar.tsx` — input + submit, navigates to /search?q=
- [ ] Add `<SearchBar />` to nav in `src/routes/__root.tsx`
- [ ] Create `src/routes/search.tsx` — reads ?q param, calls search_persons, shows results table

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

**Session boundary:** Commit after this group.

---

When done, run: `openclaw system event --text "Done: icp-gramps Phase 6 session complete — see SESSION.md" --mode now`
