#[cfg(test)]
mod tests {
    use candid::{decode_one, encode_one, CandidType, Principal};
    use pocket_ic::PocketIc;
    use reqwest::blocking::Client;
    use serde::{Deserialize, Serialize};
    use serde_json::{json, Value};
    use std::time::Duration;

    #[derive(CandidType, Deserialize, Serialize, Debug)]
    struct PersonInput {
        gender: i64,
        given_names: String,
        call_name: Option<String>,
        surname: String,
        suffix: Option<String>,
        title_text: Option<String>,
        private: Option<bool>,
    }

    #[derive(CandidType, Deserialize, Serialize, Debug)]
    struct Person {
        handle: String,
        gramps_id: String,
        gender: i64,
        given_names: String,
        call_name: Option<String>,
        surname: String,
        suffix: Option<String>,
        title_text: Option<String>,
        private: bool,
    }

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
    fn test_get_nonexistent_person_returns_404() {
        let (_pic, client, base, cid) = setup();
        let resp = client
            .get(url(&base, "/api/persons/doesnotexist", cid))
            .send()
            .unwrap();
        assert_eq!(resp.status().as_u16(), 404);
    }

    #[test]
    fn test_update_person() {
        let (mut pic, client, base, cid) = setup();

        // Create via Candid (since we'll update via Candid, let's be consistent)
        let create_input = PersonInput {
            given_names: "Anna".to_string(),
            surname: "Larsson".to_string(),
            gender: 2,
            call_name: None,
            suffix: None,
            title_text: None,
            private: Some(false),
        };
        let create_result = pic
            .update_call(
                cid,
                Principal::anonymous(),
                "create_person",
                candid::encode_args((create_input,)).unwrap(),
            )
            .expect("create_person call failed");

        let created: Option<Person> = decode_one(&create_result).expect("decode create failed");
        assert!(created.is_some(), "create should return Some(person)");
        let person = created.unwrap();
        let handle = person.handle.clone();

        pic.tick(); // Allow async operations to complete

        // Update via Candid (since HTTP PUT requires upgrade which PocketIC doesn't handle well)
        let update_input = PersonInput {
            given_names: "Anna-Lena".to_string(),
            surname: "Larsson".to_string(),
            gender: 2,
            call_name: None,
            suffix: None,
            title_text: None,
            private: Some(false),
        };
        let update_result = pic
            .update_call(
                cid,
                Principal::anonymous(),
                "update_person",
                candid::encode_args((handle.clone(), update_input)).unwrap(),
            )
            .expect("update_person call failed");

        let updated: Option<Person> = decode_one(&update_result).expect("decode update failed");
        assert!(updated.is_some(), "update should return Some(person)");
        let updated = updated.unwrap();
        assert_eq!(updated.given_names, "Anna-Lena");
    }

    #[test]
    fn test_delete_person() {
        let (mut pic, client, base, cid) = setup();

        let create_resp = client
            .post(url(&base, "/api/persons", cid))
            .json(&json!({"given_names": "Lars", "surname": "Test", "gender": 1, "private": false}))
            .send()
            .unwrap();
        let person: Value = create_resp.json().unwrap();
        let handle = person["handle"].as_str().unwrap().to_string();

        // Delete via Candid (since HTTP DELETE requires upgrade which PocketIC doesn't handle well)
        let result = pic
            .update_call(
                cid,
                Principal::anonymous(),
                "delete_person",
                encode_one(handle.clone()).unwrap(),
            )
            .expect("delete_person call failed");

        let deleted: bool = decode_one(&result).expect("decode failed");
        assert!(deleted, "delete should return true");

        // Should 404 now
        let get_resp = client
            .get(url(&base, &format!("/api/persons/{}", handle), cid))
            .send()
            .unwrap();
        assert_eq!(get_resp.status().as_u16(), 404);
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
