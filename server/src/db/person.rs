use candid::CandidType;
use ic_rusqlite::with_connection;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct Person {
    pub handle: String,
    pub gramps_id: String,
    pub gender: i64, // 0=unknown 1=male 2=female 9=other
    pub given_names: String,
    pub call_name: Option<String>,
    pub surname: String,
    pub suffix: Option<String>,
    pub title_text: Option<String>,
    pub birth_ref_handle: Option<String>,
    pub death_ref_handle: Option<String>,
    pub private: bool,
    pub change_date: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct PersonInput {
    pub gender: i64,
    pub given_names: String,
    pub call_name: Option<String>,
    pub surname: String,
    pub suffix: Option<String>,
    pub title_text: Option<String>,
    pub private: Option<bool>,
}

impl Person {
    pub fn list() -> Vec<Self> {
        with_connection(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT handle, gramps_id, gender, given_names, call_name, surname,
                        suffix, title_text, birth_ref_handle, death_ref_handle,
                        private, change_date, created_at
                 FROM person ORDER BY surname, given_names",
                )
                .unwrap();
            stmt.query_map([], |row| {
                Ok(Person {
                    handle: row.get(0)?,
                    gramps_id: row.get(1)?,
                    gender: row.get(2)?,
                    given_names: row.get(3)?,
                    call_name: row.get(4)?,
                    surname: row.get(5)?,
                    suffix: row.get(6)?,
                    title_text: row.get(7)?,
                    birth_ref_handle: row.get(8)?,
                    death_ref_handle: row.get(9)?,
                    private: row.get::<_, i64>(10)? != 0,
                    change_date: row.get(11)?,
                    created_at: row.get(12)?,
                })
            })
            .unwrap()
            .filter_map(|r| r.ok())
            .collect()
        })
    }

    pub fn get(handle: &str) -> Option<Self> {
        with_connection(|conn| {
            conn.query_row(
                "SELECT handle, gramps_id, gender, given_names, call_name, surname,
                        suffix, title_text, birth_ref_handle, death_ref_handle,
                        private, change_date, created_at
                 FROM person WHERE handle = ?1",
                [handle],
                |row| {
                    Ok(Person {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        gender: row.get(2)?,
                        given_names: row.get(3)?,
                        call_name: row.get(4)?,
                        surname: row.get(5)?,
                        suffix: row.get(6)?,
                        title_text: row.get(7)?,
                        birth_ref_handle: row.get(8)?,
                        death_ref_handle: row.get(9)?,
                        private: row.get::<_, i64>(10)? != 0,
                        change_date: row.get(11)?,
                        created_at: row.get(12)?,
                    })
                },
            )
            .ok()
        })
    }

    pub fn create(handle: &str, gramps_id: &str, input: &PersonInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "INSERT INTO person (handle, gramps_id, gender, given_names, call_name,
                          surname, suffix, title_text, private, change_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, strftime('%s','now'))",
                rusqlite::params![
                    handle,
                    gramps_id,
                    input.gender,
                    input.given_names,
                    input.call_name,
                    input.surname,
                    input.suffix,
                    input.title_text,
                    input.private.unwrap_or(false) as i64,
                ],
            )
            .ok()?;

            // Insert into FTS5 index
            let full_name = format!("{} {}", input.given_names, input.surname)
                .trim()
                .to_string();
            conn.execute(
                "INSERT INTO person_fts (person_handle, full_name) VALUES (?1, ?2)",
                rusqlite::params![handle, full_name],
            )
            .ok()?;

            Person::get(handle)
        })
    }

    pub fn update(handle: &str, input: &PersonInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "UPDATE person SET gender=?1, given_names=?2, call_name=?3,
                          surname=?4, suffix=?5, title_text=?6,
                          private=?7, change_date=strftime('%s','now')
                 WHERE handle=?8",
                rusqlite::params![
                    input.gender,
                    input.given_names,
                    input.call_name,
                    input.surname,
                    input.suffix,
                    input.title_text,
                    input.private.unwrap_or(false) as i64,
                    handle,
                ],
            )
            .ok()?;

            // Update FTS5 index (delete + reinsert)
            conn.execute(
                "INSERT INTO person_fts(person_fts, person_handle, full_name) VALUES ('delete', ?1, '')",
                rusqlite::params![handle],
            )
            .ok()?;

            let full_name = format!("{} {}", input.given_names, input.surname)
                .trim()
                .to_string();
            conn.execute(
                "INSERT INTO person_fts (person_handle, full_name) VALUES (?1, ?2)",
                rusqlite::params![handle, full_name],
            )
            .ok()?;

            Person::get(handle)
        })
    }

    pub fn delete(handle: &str) -> bool {
        with_connection(|conn| {
            // Delete from FTS5 index
            conn.execute(
                "INSERT INTO person_fts(person_fts, person_handle, full_name) VALUES ('delete', ?1, '')",
                [handle],
            )
            .ok();

            conn.execute("DELETE FROM person WHERE handle = ?1", [handle])
                .map(|n| n > 0)
                .unwrap_or(false)
        })
    }

    pub fn count() -> i64 {
        with_connection(|conn| {
            conn.query_row("SELECT COUNT(*) FROM person", [], |r| r.get(0))
                .unwrap_or(0)
        })
    }

    pub fn search(query: &str) -> Vec<Self> {
        with_connection(|conn| {
            let search_query = format!("{}*", query.trim());
            let mut stmt = conn
                .prepare(
                    "SELECT p.handle, p.gramps_id, p.gender, p.given_names, p.call_name, p.surname,
                            p.suffix, p.title_text, p.birth_ref_handle, p.death_ref_handle,
                            p.private, p.change_date, p.created_at
                     FROM person p
                     JOIN person_fts f ON f.person_handle = p.handle
                     WHERE person_fts MATCH ?1
                     ORDER BY rank
                     LIMIT 50",
                )
                .unwrap();
            stmt.query_map([search_query], |row| {
                Ok(Person {
                    handle: row.get(0)?,
                    gramps_id: row.get(1)?,
                    gender: row.get(2)?,
                    given_names: row.get(3)?,
                    call_name: row.get(4)?,
                    surname: row.get(5)?,
                    suffix: row.get(6)?,
                    title_text: row.get(7)?,
                    birth_ref_handle: row.get(8)?,
                    death_ref_handle: row.get(9)?,
                    private: row.get::<_, i64>(10)? != 0,
                    change_date: row.get(11)?,
                    created_at: row.get(12)?,
                })
            })
            .unwrap()
            .filter_map(|r| r.ok())
            .collect()
        })
    }
}

/// Attach an event to a person and set it as their birth ref.
pub fn set_birth_event(person_handle: &str, event_handle: &str) {
    with_connection(|conn| {
        // Insert into person_event_ref
        conn.execute(
            "INSERT OR REPLACE INTO person_event_ref (person_handle, event_handle, role)
             VALUES (?1, ?2, 'primary')",
            [person_handle, event_handle],
        )
        .ok();
        // Update person's birth_ref_handle
        conn.execute(
            "UPDATE person SET birth_ref_handle = ?1 WHERE handle = ?2",
            [event_handle, person_handle],
        )
        .ok();
    });
}

/// Attach an event to a person and set it as their death ref.
pub fn set_death_event(person_handle: &str, event_handle: &str) {
    with_connection(|conn| {
        // Insert into person_event_ref
        conn.execute(
            "INSERT OR REPLACE INTO person_event_ref (person_handle, event_handle, role)
             VALUES (?1, ?2, 'primary')",
            [person_handle, event_handle],
        )
        .ok();
        // Update person's death_ref_handle
        conn.execute(
            "UPDATE person SET death_ref_handle = ?1 WHERE handle = ?2",
            [event_handle, person_handle],
        )
        .ok();
    });
}

/// Get the birth event for a person (follows birth_ref_handle).
pub fn get_birth_event(person_handle: &str) -> Option<super::event::Event> {
    with_connection(|conn| {
        let event_handle: String = conn
            .query_row(
                "SELECT birth_ref_handle FROM person WHERE handle = ?1",
                [person_handle],
                |row| row.get(0),
            )
            .ok()?;
        super::event::Event::get(&event_handle)
    })
}

/// Get the death event for a person (follows death_ref_handle).
pub fn get_death_event(person_handle: &str) -> Option<super::event::Event> {
    with_connection(|conn| {
        let event_handle: String = conn
            .query_row(
                "SELECT death_ref_handle FROM person WHERE handle = ?1",
                [person_handle],
                |row| row.get(0),
            )
            .ok()?;
        super::event::Event::get(&event_handle)
    })
}
