# Phase 3 — Person Frontend: Implementation Plan

**Goal:** React pages for listing, viewing, adding, and editing persons. Data fetched via Candid API.

## Notes for the Agent

- The canister actor hook should read the canister ID from `import.meta.env.VITE_CANISTER_ID_ICP_GRAMPS`
- For local dev, dfx sets this in `.env` automatically on deploy
- Use `@dfinity/agent` + `@dfinity/candid` to build the actor
- The generated `server.did` in `server/server.did` defines the Candid interface — use it
- TanStack Router v1 file-based routing: routes live in `src/routes/`
- Dynamic segment syntax for TanStack Router: file named `$handle.tsx` → param is `params.handle`
- For nested route `/persons/$handle/edit`, create `src/routes/persons/$handle.edit.tsx` (flat file) or `src/routes/persons/$handle/edit.tsx` (nested dir)

## Spec Groups

---

### Group A: Spec 3.1 — Person Frontend

**Tasks:**

- [x] Add `@dfinity/agent`, `@dfinity/candid`, `@dfinity/principal` to package.json and run `pnpm install`
- [x] Create `src/declarations/` directory with canister type declarations (based on server.did)
- [x] Create `src/hooks/useActor.ts` — returns typed IC actor using the canister ID env var
- [x] Create `src/components/GenderIcon.tsx` — renders ♂/♀/? for gender int (1=♂, 2=♀, else=?)
- [x] Create `src/components/PersonName.tsx` — formats full name: title + given + surname + suffix
- [x] Create `src/components/LoadingSpinner.tsx` — simple spinner div
- [x] Create `src/routes/persons/index.tsx` — person list page (fetch list_persons, table with Name/Gender/Actions, empty state, "Add person" button)
- [x] Create `src/routes/persons/new.tsx` — add person form (given_names, surname, gender select, call_name, title_text, suffix, private checkbox; submit calls create_person; on success navigate to /persons/$handle)
- [x] Create `src/routes/persons/$handle.tsx` — person detail page (fetch get_person, display all fields, Edit/Delete buttons, delete with confirm dialog)
- [x] Create `src/routes/persons/$handle.edit.tsx` — edit person form (same fields as new, pre-populated; submit calls update_person)
- [x] Update `src/routes/__root.tsx` nav to include a "Persons" link to `/persons`
- [x] Verify: `pnpm run build` passes, `tsc --noEmit` passes

**Verification:**
```bash
pnpm run build
tsc --noEmit
```

**Session boundary:** Commit after this group.

---

## Verification Protocol (end of phase)

```bash
pnpm run build
tsc --noEmit
```

## Session Prompt Template

Same as PROMPT.md in repo root — reads this PLAN.md, implements Group A, commits, appends SESSION.md, stops.

When done, run: `openclaw system event --text "Done: icp-gramps Phase 3 session complete — see SESSION.md" --mode now`
