# icp-gramps

A genealogy application on the [Internet Computer](https://internetcomputer.org/), inspired by [Gramps](https://gramps-project.org/), built with Rust + React.

## Overview

icp-gramps is a fully decentralized genealogy app: no backend servers, no databases to manage — everything lives in a single ICP canister. Research your family history, record persons, families, events, and places, all stored permanently on-chain.

**Stack:**
- **Rust canister** — SQLite (ic-rusqlite) + ic-asset-router for file-based HTTP routing
- **React frontend** — TanStack Router, Tailwind CSS, fetches data from Candid API
- **Build tooling** — Vite, pnpm, dfx, wasi2ic

**Architecture:** Modeled after [promptathon-showcase](https://github.com/kristoferlund/promptathon-showcase). React frontend is compiled by Vite and embedded into the Rust canister at compile time via `include_dir!`. The canister handles both the React SPA and a REST-style JSON API via ic-asset-router.

## Features (Planned)

- [ ] Person management (name, gender, birth, death)
- [ ] Family relationships (parents, spouses, children)
- [ ] Events (birth, death, marriage, baptism, and more)
- [ ] Places (geographic locations linked to events)
- [ ] Notes
- [ ] Full-text person search
- [ ] Pedigree / ancestor chart

## Development

See [RALPH.md](RALPH.md) for the AI-assisted development process.

### Prerequisites

- `dfx` CLI
- `pnpm`
- `cargo` with `wasm32-wasip1` target
- `wasi2ic`

### Quick Start

```bash
dfx start --clean --background
dfx deploy
```

## Data Model

Based on the [Gramps SQL Database](https://www.gramps-project.org/wiki/index.php/Gramps_SQL_Database) schema. Core entities: `person`, `family`, `event`, `place`, `citation`, `source`, `note`, `tag`.

## License

MIT
