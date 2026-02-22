use candid::CandidType;
use ic_rusqlite::with_connection;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct Event {
    pub handle: String,
    pub gramps_id: String,
    pub event_type: String, // "birth" | "death" | "marriage" | "baptism" | ...
    pub place_text: Option<String>, // free text for now (Phase 6 adds Place entity)
    pub date_sortval: Option<i64>, // YYYYMMDD integer for sorting
    pub date_text: Option<String>, // human-readable: "15 Mar 1872", "Abt. 1900", etc.
    pub description: String,
    pub private: bool,
    pub change_date: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct EventInput {
    pub event_type: String,
    pub place_text: Option<String>,
    pub date_sortval: Option<i64>,
    pub date_text: Option<String>,
    pub description: Option<String>,
    pub private: Option<bool>,
}

impl Event {
    pub fn create(handle: &str, gramps_id: &str, input: &EventInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "INSERT INTO event (handle, gramps_id, event_type, place_text, date_sortval,
                          date_text, description, private, change_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, strftime('%s','now'))",
                rusqlite::params![
                    handle,
                    gramps_id,
                    input.event_type,
                    input.place_text,
                    input.date_sortval,
                    input.date_text,
                    input.description.as_deref().unwrap_or(""),
                    input.private.unwrap_or(false) as i64,
                ],
            )
            .ok()?;
            Event::get(handle)
        })
    }

    pub fn get(handle: &str) -> Option<Self> {
        with_connection(|conn| {
            conn.query_row(
                "SELECT handle, gramps_id, event_type, place_text, date_sortval,
                        date_text, description, private, change_date, created_at
                 FROM event WHERE handle = ?1",
                [handle],
                |row| {
                    Ok(Event {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        event_type: row.get(2)?,
                        place_text: row.get(3)?,
                        date_sortval: row.get(4)?,
                        date_text: row.get(5)?,
                        description: row.get(6)?,
                        private: row.get::<_, i64>(7)? != 0,
                        change_date: row.get(8)?,
                        created_at: row.get(9)?,
                    })
                },
            )
            .ok()
        })
    }

    pub fn update(handle: &str, input: &EventInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "UPDATE event SET event_type=?1, place_text=?2, date_sortval=?3,
                          date_text=?4, description=?5, private=?6,
                          change_date=strftime('%s','now')
                 WHERE handle=?7",
                rusqlite::params![
                    input.event_type,
                    input.place_text,
                    input.date_sortval,
                    input.date_text,
                    input.description.as_deref().unwrap_or(""),
                    input.private.unwrap_or(false) as i64,
                    handle,
                ],
            )
            .ok()?;
            Event::get(handle)
        })
    }

    pub fn delete(handle: &str) -> bool {
        with_connection(|conn| {
            conn.execute("DELETE FROM event WHERE handle = ?1", [handle])
                .map(|n| n > 0)
                .unwrap_or(false)
        })
    }
}
