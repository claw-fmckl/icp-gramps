# Phase 8 — Fix & Test: Implementation Plan

## IMPORTANT CONTEXT FOR THE AGENT

The codebase has compilation errors from previous phases. The ic-asset-router and ic-rusqlite APIs were used incorrectly. Read the spec carefully — it lists every fix needed with before/after examples.

**Key rules:**
- `with_connection(|conn| { ... })` — NO type annotation on conn (it's `RefMut<'_, Connection>`)
- `rusqlite::params![a, b]` → use tuple syntax `(a, b)` or `(a,)` for single values
- `Cow::Borrowed(b"text")` → `b"text" as &[u8]`
- `include_str!("../../dist/...")` from routes/ → use `concat!(env!("CARGO_MANIFEST_DIR"), "/../dist/...")`  
- `include_dir!("$CARGO_MANIFEST_DIR/../../dist")` → `include_dir!("$CARGO_MANIFEST_DIR/../dist")`
- Dynamic route params: `ctx.params.handle` (struct field), not `ctx.params.get("handle")`
- After EVERY change, verify with: `source ~/.cargo/env && cargo build -p server --target wasm32-wasip1 --release 2>&1 | grep "^error" | head -20`

**Build order (critical):**
1. `pnpm run build` first (creates dist/ needed for include_str!)
2. Then `cargo build -p server --target wasm32-wasip1 --release`

## Spec Groups

### Group A: Fix all compilation errors

**Tasks:**

- [x] Fix `server/src/lib.rs`: change `include_dir!` path from `../../dist` to `../dist`
- [x] Fix `server/src/lib.rs`: remove type annotation from all `with_connection(|conn: &mut Connection|` → `with_connection(|conn|`
- [x] Fix `server/src/routes/index.rs`: change `include_str!("../../dist/index.html")` to use `concat!(env!("CARGO_MANIFEST_DIR"), "/../dist/index.html")`
- [x] Fix ALL files in `server/src/db/`: replace `rusqlite::params![a, b, c]` with tuple syntax `(a, b, c)`
- [x] Fix ALL route handler files: replace `Cow::Borrowed(b"...")` with `b"..." as &[u8]`
- [x] Fix `server/src/routes/api/persons/_handle/index.rs`: replace `ctx.params.get("handle")` with `ctx.params.handle`
- [x] Fix any other route files using `.get()` on params
- [x] Run `pnpm run build` then `cargo build -p server --target wasm32-wasip1 --release` — must compile clean

**Verification:**
```bash
cd ~/gh/icp-gramps
pnpm run build
source ~/.cargo/env && source ~/.local/share/dfx/env
cargo build -p server --target wasm32-wasip1 --release 2>&1 | grep "^error" | wc -l
# Must output: 0
wasi2ic target/wasm32-wasip1/release/server.wasm target/wasm32-wasip1/release/server_wasi2ic.wasm
echo "WASM built OK"
```

**Session boundary:** Commit after this group. Message: `fix: resolve all compilation errors — canister builds clean`

---

### Group B: E2E tests with pocket-ic

**Tasks:**

- [ ] Add `tests/e2e` to workspace members in root `Cargo.toml`
- [ ] Create `tests/e2e/Cargo.toml` with pocket-ic, reqwest, serde_json dev-dependencies
- [ ] Create `tests/e2e/build.rs`
- [ ] Create `tests/e2e/src/lib.rs` with full test suite (see spec)
- [ ] Run `cargo test -p e2e-tests 2>&1` — all 6 tests must pass

**Verification:**
```bash
source ~/.cargo/env && source ~/.local/share/dfx/env
cargo test -p e2e-tests 2>&1
# All tests must pass: test result: ok. 6 passed
```

**Session boundary:** Commit after this group. Message: `test: add pocket-ic e2e test suite — all tests passing`

---

## Final Verification Protocol

```bash
cd ~/gh/icp-gramps
pnpm run build
source ~/.cargo/env && source ~/.local/share/dfx/env
# Full compile
cargo build -p server --target wasm32-wasip1 --release
wasi2ic target/wasm32-wasip1/release/server.wasm target/wasm32-wasip1/release/server_wasi2ic.wasm
# E2E tests
cargo test -p e2e-tests
# Deploy
dfx start --clean --background
sleep 3
dfx deploy
echo "All done — canister URL in .env"
dfx stop
```

When done, run: `openclaw system event --text "Done: icp-gramps Phase 8 complete — compiles and tests pass" --mode now`
