# icp-gramps — Specs Overview

A genealogy application on the Internet Computer. Gramps-inspired. SQLite + ic-asset-router + React.

## Architecture

**Frontend:** React + Vite + TanStack Router + Tailwind CSS, compiled to `dist/` and embedded into the canister via `include_dir!`.

**Backend:** Rust canister using:
- `ic-asset-router` for file-based HTTP routing (routes in `server/src/routes/`)
- `ic-rusqlite` for SQLite
- `ic-sql-migrate` for schema migrations
- `minijinja` for SSR meta tags on key pages
- `include_dir` for bundling the Vite `dist/` into the canister WASM

**Data model:** Based on Gramps SQL schema. Core entities: `person`, `family`, `event`, `place`, `note`, `source`, `citation`, `tag`.

## Reference Projects

- [promptathon-showcase](https://github.com/kristoferlund/promptathon-showcase) — primary architectural reference
- [ic-asset-router](https://github.com/kristoferlund/ic-asset-router) — routing library being used

## Phases

### Phase 1 — Bootstrap
Goal: a deployable skeleton with empty pages, correct build pipeline, and database schema in place.

Items:
- [1.1 — Project Scaffold](Phase%201/1.1%20—%20Project%20Scaffold.md)
- [1.2 — Database Schema](Phase%201/1.2%20—%20Database%20Schema.md)
- [1.3 — Canister Wiring](Phase%201/1.3%20—%20Canister%20Wiring.md)
- [1.4 — React Frontend Skeleton](Phase%201/1.4%20—%20React%20Frontend%20Skeleton.md)

### Phase 2 — Person Backend
Goal: Candid API + HTTP JSON endpoints for creating, reading, updating, and deleting persons.

### Phase 3 — Person Frontend
Goal: React pages for listing, viewing, adding, and editing persons.

### Phase 4 — Events
Goal: Birth/death/marriage events linked to persons and families.

### Phase 5 — Families
Goal: Family units with father, mother, and children links.

### Phase 6 — Places
Goal: Place entities linked to events.

### Phase 7 — Search
Goal: Full-text search (FTS5) across person names.

### Phase 8 — Pedigree Chart
Goal: Ancestor tree visualization.
