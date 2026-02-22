use candid::CandidType;
use ic_rusqlite::with_connection;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct Family {
    pub handle: String,
    pub gramps_id: String,
    pub father_handle: Option<String>,
    pub mother_handle: Option<String>,
    pub family_type: String,
    pub private: bool,
    pub change_date: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct FamilyChild {
    pub family_handle: String,
    pub child_handle: String,
    pub father_rel: String,
    pub mother_rel: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct FamilyInput {
    pub father_handle: Option<String>,
    pub mother_handle: Option<String>,
    pub family_type: Option<String>,
    pub private: Option<bool>,
}

impl Family {
    pub fn list() -> Vec<Self> {
        with_connection(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT handle, gramps_id, father_handle, mother_handle, family_type,
                            private, change_date, created_at
                     FROM family ORDER BY gramps_id",
                )
                .unwrap();
            stmt.query_map([], |row| {
                Ok(Family {
                    handle: row.get(0)?,
                    gramps_id: row.get(1)?,
                    father_handle: row.get(2)?,
                    mother_handle: row.get(3)?,
                    family_type: row.get(4)?,
                    private: row.get::<_, i64>(5)? != 0,
                    change_date: row.get(6)?,
                    created_at: row.get(7)?,
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
                "SELECT handle, gramps_id, father_handle, mother_handle, family_type,
                        private, change_date, created_at
                 FROM family WHERE handle = ?1",
                [handle],
                |row| {
                    Ok(Family {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        father_handle: row.get(2)?,
                        mother_handle: row.get(3)?,
                        family_type: row.get(4)?,
                        private: row.get::<_, i64>(5)? != 0,
                        change_date: row.get(6)?,
                        created_at: row.get(7)?,
                    })
                },
            )
            .ok()
        })
    }

    pub fn create(handle: &str, gramps_id: &str, input: &FamilyInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "INSERT INTO family (handle, gramps_id, father_handle, mother_handle,
                          family_type, private, change_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, strftime('%s','now'))",
                rusqlite::params![
                    handle,
                    gramps_id,
                    input.father_handle,
                    input.mother_handle,
                    input.family_type.as_deref().unwrap_or("married"),
                    input.private.unwrap_or(false) as i64,
                ],
            )
            .ok()?;
            Family::get(handle)
        })
    }

    pub fn update(handle: &str, input: &FamilyInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "UPDATE family SET father_handle=?1, mother_handle=?2, family_type=?3,
                          private=?4, change_date=strftime('%s','now')
                 WHERE handle=?5",
                rusqlite::params![
                    input.father_handle,
                    input.mother_handle,
                    input.family_type.as_deref().unwrap_or("married"),
                    input.private.unwrap_or(false) as i64,
                    handle,
                ],
            )
            .ok()?;
            Family::get(handle)
        })
    }

    pub fn delete(handle: &str) -> bool {
        with_connection(|conn| {
            conn.execute("DELETE FROM family WHERE handle = ?1", [handle])
                .map(|n| n > 0)
                .unwrap_or(false)
        })
    }
}

/// Add a child to a family.
pub fn add_child(
    family_handle: &str,
    child_handle: &str,
    father_rel: &str,
    mother_rel: &str,
) -> bool {
    with_connection(|conn| {
        conn.execute(
            "INSERT OR REPLACE INTO family_child (family_handle, child_handle, father_rel, mother_rel)
             VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![family_handle, child_handle, father_rel, mother_rel],
        )
        .is_ok()
    })
}

/// Remove a child from a family.
pub fn remove_child(family_handle: &str, child_handle: &str) -> bool {
    with_connection(|conn| {
        conn.execute(
            "DELETE FROM family_child WHERE family_handle = ?1 AND child_handle = ?2",
            rusqlite::params![family_handle, child_handle],
        )
        .map(|n| n > 0)
        .unwrap_or(false)
    })
}

/// Get all children for a family (returns Person structs).
pub fn get_children(family_handle: &str) -> Vec<super::person::Person> {
    with_connection(|conn| {
        let mut stmt = conn
            .prepare(
                "SELECT p.handle, p.gramps_id, p.gender, p.given_names, p.call_name, p.surname,
                        p.suffix, p.title_text, p.birth_ref_handle, p.death_ref_handle,
                        p.private, p.change_date, p.created_at
                 FROM person p
                 JOIN family_child fc ON fc.child_handle = p.handle
                 WHERE fc.family_handle = ?1
                 ORDER BY p.surname, p.given_names",
            )
            .unwrap();
        stmt.query_map([family_handle], |row| {
            Ok(super::person::Person {
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

/// Get families where a person is a child.
pub fn get_parent_families(person_handle: &str) -> Vec<Family> {
    with_connection(|conn| {
        let mut stmt = conn
            .prepare(
                "SELECT f.handle, f.gramps_id, f.father_handle, f.mother_handle, f.family_type,
                        f.private, f.change_date, f.created_at
                 FROM family f
                 JOIN family_child fc ON fc.family_handle = f.handle
                 WHERE fc.child_handle = ?1
                 ORDER BY f.gramps_id",
            )
            .unwrap();
        stmt.query_map([person_handle], |row| {
            Ok(Family {
                handle: row.get(0)?,
                gramps_id: row.get(1)?,
                father_handle: row.get(2)?,
                mother_handle: row.get(3)?,
                family_type: row.get(4)?,
                private: row.get::<_, i64>(5)? != 0,
                change_date: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
    })
}

/// Get families where a person is a parent (father or mother).
pub fn get_own_families(person_handle: &str) -> Vec<Family> {
    with_connection(|conn| {
        let mut stmt = conn
            .prepare(
                "SELECT handle, gramps_id, father_handle, mother_handle, family_type,
                        private, change_date, created_at
                 FROM family
                 WHERE father_handle = ?1 OR mother_handle = ?1
                 ORDER BY gramps_id",
            )
            .unwrap();
        stmt.query_map([person_handle], |row| {
            Ok(Family {
                handle: row.get(0)?,
                gramps_id: row.get(1)?,
                father_handle: row.get(2)?,
                mother_handle: row.get(3)?,
                family_type: row.get(4)?,
                private: row.get::<_, i64>(5)? != 0,
                change_date: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
    })
}
