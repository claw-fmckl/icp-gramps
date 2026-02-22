use candid::CandidType;
use ic_rusqlite::with_connection;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct Place {
    pub handle: String,
    pub gramps_id: String,
    pub title: String,      // full display title, e.g. "Stockholm, Sweden"
    pub name: String,       // short name, e.g. "Stockholm"
    pub place_type: String, // "city" | "county" | "state" | "country" | "parish" | "unknown"
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub code: Option<String>, // postal code, FIPS, etc.
    pub private: bool,
    pub change_date: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct PlaceInput {
    pub title: String,
    pub name: Option<String>,
    pub place_type: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub code: Option<String>,
    pub private: Option<bool>,
}

impl Place {
    pub fn create(handle: &str, gramps_id: &str, input: &PlaceInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "INSERT INTO place (handle, gramps_id, title, name, place_type, latitude,
                          longitude, code, private, change_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, strftime('%s','now'))",
                rusqlite::params![
                    handle,
                    gramps_id,
                    input.title,
                    input.name.as_deref().unwrap_or(&input.title),
                    input.place_type.as_deref().unwrap_or("unknown"),
                    input.latitude,
                    input.longitude,
                    input.code,
                    input.private.unwrap_or(false) as i64,
                ],
            )
            .ok()?;
            Place::get(handle)
        })
    }

    pub fn get(handle: &str) -> Option<Self> {
        with_connection(|conn| {
            conn.query_row(
                "SELECT handle, gramps_id, title, name, place_type, latitude,
                        longitude, code, private, change_date, created_at
                 FROM place WHERE handle = ?1",
                [handle],
                |row| {
                    Ok(Place {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        title: row.get(2)?,
                        name: row.get(3)?,
                        place_type: row.get(4)?,
                        latitude: row.get(5)?,
                        longitude: row.get(6)?,
                        code: row.get(7)?,
                        private: row.get::<_, i64>(8)? != 0,
                        change_date: row.get(9)?,
                        created_at: row.get(10)?,
                    })
                },
            )
            .ok()
        })
    }

    pub fn list() -> Vec<Self> {
        with_connection(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT handle, gramps_id, title, name, place_type, latitude,
                            longitude, code, private, change_date, created_at
                     FROM place ORDER BY title",
                )
                .ok()?;
            let rows = stmt
                .query_map([], |row| {
                    Ok(Place {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        title: row.get(2)?,
                        name: row.get(3)?,
                        place_type: row.get(4)?,
                        latitude: row.get(5)?,
                        longitude: row.get(6)?,
                        code: row.get(7)?,
                        private: row.get::<_, i64>(8)? != 0,
                        change_date: row.get(9)?,
                        created_at: row.get(10)?,
                    })
                })
                .ok()?;
            Some(rows.filter_map(Result::ok).collect())
        })
        .unwrap_or_default()
    }

    pub fn update(handle: &str, input: &PlaceInput) -> Option<Self> {
        with_connection(|conn| {
            conn.execute(
                "UPDATE place SET title=?1, name=?2, place_type=?3, latitude=?4,
                          longitude=?5, code=?6, private=?7,
                          change_date=strftime('%s','now')
                 WHERE handle=?8",
                rusqlite::params![
                    input.title,
                    input.name.as_deref().unwrap_or(&input.title),
                    input.place_type.as_deref().unwrap_or("unknown"),
                    input.latitude,
                    input.longitude,
                    input.code,
                    input.private.unwrap_or(false) as i64,
                    handle,
                ],
            )
            .ok()?;
            Place::get(handle)
        })
    }

    pub fn delete(handle: &str) -> bool {
        with_connection(|conn| {
            conn.execute("DELETE FROM place WHERE handle = ?1", [handle])
                .map(|n| n > 0)
                .unwrap_or(false)
        })
    }

    pub fn search(query: &str) -> Vec<Self> {
        if query.is_empty() {
            return Vec::new();
        }

        with_connection(|conn| {
            let search_pattern = format!("%{}%", query);
            let mut stmt = conn
                .prepare(
                    "SELECT handle, gramps_id, title, name, place_type, latitude,
                            longitude, code, private, change_date, created_at
                     FROM place 
                     WHERE title LIKE ?1 OR name LIKE ?1
                     ORDER BY title
                     LIMIT 20",
                )
                .ok()?;
            let rows = stmt
                .query_map([&search_pattern], |row| {
                    Ok(Place {
                        handle: row.get(0)?,
                        gramps_id: row.get(1)?,
                        title: row.get(2)?,
                        name: row.get(3)?,
                        place_type: row.get(4)?,
                        latitude: row.get(5)?,
                        longitude: row.get(6)?,
                        code: row.get(7)?,
                        private: row.get::<_, i64>(8)? != 0,
                        change_date: row.get(9)?,
                        created_at: row.get(10)?,
                    })
                })
                .ok()?;
            Some(rows.filter_map(Result::ok).collect())
        })
        .unwrap_or_default()
    }
}
