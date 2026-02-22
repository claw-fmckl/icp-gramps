// Database helpers module — handle generation, gramps_id generation, common queries.

pub mod event;
pub mod person;

use ic_cdk::api::time;

/// Generate a random handle (16 hex chars like Gramps).
/// Uses IC's raw_rand for randomness.
pub async fn new_handle() -> String {
    let (bytes,): (Vec<u8>,) = ic_cdk::api::management_canister::main::raw_rand()
        .await
        .expect("raw_rand failed");
    hex::encode(&bytes[..8])
}

/// Allocate the next Gramps ID for an entity type (person → "I0001", family → "F0001", etc.)
pub fn next_gramps_id(conn: &mut rusqlite::Connection, entity_type: &str) -> String {
    let prefix = match entity_type {
        "person" => "I",
        "family" => "F",
        "event" => "E",
        "place" => "P",
        "source" => "S",
        "citation" => "C",
        "note" => "N",
        "tag" => "T",
        _ => "X",
    };
    let n: i64 = conn
        .query_row(
            "UPDATE id_counter SET last_id = last_id + 1 WHERE entity_type = ?1 RETURNING last_id",
            [entity_type],
            |row| row.get(0),
        )
        .expect("id_counter update failed");
    format!("{}{:04}", prefix, n)
}
