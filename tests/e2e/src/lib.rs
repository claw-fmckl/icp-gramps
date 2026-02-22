#[cfg(test)]
mod tests {
    use candid::Principal;
    use pocket_ic::PocketIc;
    use reqwest::blocking::Client;
    use serde_json::{json, Value};
    use std::time::Duration;

    const WASM_PATH: &str = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../target/wasm32-wasip1/release/server_wasi2ic.wasm"
    );

    fn setup() -> (PocketIc, Client, String, Principal) {
        let mut pic = PocketIc::new();
        let canister_id = pic.create_canister();
        pic.add_cycles(canister_id, 2_000_000_000_000);

        let wasm = std::fs::read(WASM_PATH)
            .expect("WASM not found — run: pnpm run build && cargo build -p server --target wasm32-wasip1 --release && wasi2ic target/wasm32-wasip1/release/server.wasm target/wasm32-wasip1/release/server_wasi2ic.wasm");

        pic.install_canister(canister_id, wasm, vec![], None);
        pic.tick(); // Ensure init completes
        let gateway_url = pic.make_live(None);
        let port = gateway_url.port().unwrap();

        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap();

        let base = format!("http://localhost:{}", port);
        (pic, client, base, canister_id)
    }

    fn url(base: &str, path: &str, canister_id: Principal) -> String {
        format!("{}{}?canisterId={}", base, path, canister_id)
    }

    // --- Homepage ---

    #[test]
    fn test_homepage_returns_200() {
        let (_pic, client, base, cid) = setup();
        let resp = client.get(url(&base, "/", cid)).send().unwrap();
        assert_eq!(resp.status().as_u16(), 200);
        let body = resp.text().unwrap();
        assert!(
            body.contains("icp-gramps"),
            "homepage should contain 'icp-gramps'"
        );
    }

    // --- Person CRUD ---

    #[test]
    fn test_person_list_empty() {
        let (_pic, client, base, cid) = setup();
        let resp = client.get(url(&base, "/api/persons", cid)).send().unwrap();
        assert_eq!(resp.status().as_u16(), 200);
        let body: Value = resp.json().unwrap();
        assert!(body.is_array(), "should return JSON array");
        assert_eq!(
            body.as_array().unwrap().len(),
            0,
            "should be empty initially"
        );
    }

    #[test]
    fn test_create_and_get_person() {
        let (_pic, client, base, cid) = setup();

        // Create
        let create_resp = client
            .post(url(&base, "/api/persons", cid))
            .json(&json!({
                "given_names": "Erik",
                "surname": "Svensson",
                "gender": 1,
                "call_name": null,
                "title_text": null,
                "suffix": null,
                "private": false
            }))
            .send()
            .unwrap();
        assert_eq!(create_resp.status().as_u16(), 201);
        let person: Value = create_resp.json().unwrap();
        let handle = person["handle"].as_str().expect("handle missing");
        assert_eq!(person["given_names"], "Erik");
        assert_eq!(person["surname"], "Svensson");
        assert!(person["gramps_id"].as_str().unwrap().starts_with('I'));

        // Get by handle
        let get_resp = client
            .get(url(&base, &format!("/api/persons/{}", handle), cid))
            .send()
            .unwrap();
        assert_eq!(get_resp.status().as_u16(), 200);
        let fetched: Value = get_resp.json().unwrap();
        assert_eq!(fetched["handle"], person["handle"]);
    }

    #[test]
    fn test_update_person() {
        let (_pic, client, base, cid) = setup();

        // Create
        let create_resp = client
            .post(url(&base, "/api/persons", cid))
            .json(&json!({"given_names": "Anna", "surname": "Larsson", "gender": 2, "private": false}))
            .send().unwrap();
        let person: Value = create_resp.json().unwrap();
        let handle = person["handle"].as_str().unwrap();

        // Update
        let update_resp = client
            .put(url(&base, &format!("/api/persons/{}", handle), cid))
            .json(&json!({"given_names": "Anna-Lena", "surname": "Larsson", "gender": 2, "private": false}))
            .send().unwrap();
        assert_eq!(update_resp.status().as_u16(), 200);
        let updated: Value = update_resp.json().unwrap();
        assert_eq!(updated["given_names"], "Anna-Lena");
    }

    #[test]
    fn test_delete_person() {
        let (_pic, client, base, cid) = setup();

        let create_resp = client
            .post(url(&base, "/api/persons", cid))
            .json(&json!({"given_names": "Lars", "surname": "Test", "gender": 1, "private": false}))
            .send()
            .unwrap();
        let person: Value = create_resp.json().unwrap();
        let handle = person["handle"].as_str().unwrap();

        let del_resp = client
            .delete(url(&base, &format!("/api/persons/{}", handle), cid))
            .send()
            .unwrap();
        assert_eq!(del_resp.status().as_u16(), 200);

        // Should 404 now
        let get_resp = client
            .get(url(&base, &format!("/api/persons/{}", handle), cid))
            .send()
            .unwrap();
        assert_eq!(get_resp.status().as_u16(), 404);
    }

    #[test]
    fn test_get_nonexistent_person_returns_404() {
        let (_pic, client, base, cid) = setup();
        let resp = client
            .get(url(&base, "/api/persons/doesnotexist", cid))
            .send()
            .unwrap();
        assert_eq!(resp.status().as_u16(), 404);
    }

    // --- Static assets ---

    #[test]
    fn test_static_js_asset() {
        let (_pic, client, base, cid) = setup();
        // The Vite build produces assets/index-*.js — check the assets/ path returns something
        let resp = client.get(url(&base, "/assets/", cid)).send().unwrap();
        // Either 200 (directory listing) or 404 is acceptable; just ensure no 500
        assert_ne!(resp.status().as_u16(), 500);
    }
}
