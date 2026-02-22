fn main() {
    // Tell cargo to rebuild tests if the WASM changes
    println!("cargo:rerun-if-changed=../../target/wasm32-wasip1/release/server_wasi2ic.wasm");
}
