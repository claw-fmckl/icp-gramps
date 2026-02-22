# Phase 7 — Search: Implementation Plan

## Spec Groups

### Group A: Spec 7.1 — Search

**Tasks:**

- [x] Update `Person::create` in `server/src/db/person.rs` — insert into person_fts after successful insert
- [x] Update `Person::update` — delete + reinsert into person_fts
- [x] Update `Person::delete` — delete from person_fts
- [x] Implement `Person::search(query: &str) -> Vec<Person>` using FTS5 MATCH with prefix wildcard
- [x] Add `search_persons(query: String) -> Vec<Person>` Candid query method to `server/src/lib.rs`
- [x] Update `server/server.did` with search_persons method
- [x] Update `src/declarations/` with search_persons method
- [x] Update `src/routes/__root.tsx` — add search input to nav with 300ms debounce, dropdown results
- [x] Create `src/routes/search.tsx` — search results page at `/search?q=...`

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

When done, run: `openclaw system event --text "Done: icp-gramps Phase 7 session complete — see SESSION.md" --mode now`
