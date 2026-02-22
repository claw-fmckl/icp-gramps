-- ============================================================
-- icp-gramps initial schema
-- Based on the Gramps genealogy data model
-- ============================================================

-- -------------------------------------------------------
-- person
-- Core genealogical entity.
-- Primary name fields are denormalized here for fast listing/sorting.
-- Alternate names are in person_name.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS person (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    gender          INTEGER NOT NULL DEFAULT 0,  -- 0=unknown, 1=male, 2=female, 9=other
    given_names     TEXT NOT NULL DEFAULT '',
    call_name       TEXT,
    surname         TEXT NOT NULL DEFAULT '',
    suffix          TEXT,
    title_text      TEXT,
    birth_ref_handle TEXT,                        -- event handle for birth (denormalized)
    death_ref_handle TEXT,                        -- event handle for death (denormalized)
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_person_surname   ON person (surname);
CREATE INDEX IF NOT EXISTS idx_person_gramps_id ON person (gramps_id);

-- -------------------------------------------------------
-- person_name
-- Alternate names for a person (birth, married, also known as, etc.)
-- The primary name is also stored in person.given_names/surname for
-- fast display but also exists as a row here with primary_name=1.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS person_name (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    person_handle   TEXT NOT NULL REFERENCES person(handle) ON DELETE CASCADE,
    name_type       TEXT NOT NULL DEFAULT 'birth',  -- birth, married, aka, ...
    given_names     TEXT NOT NULL DEFAULT '',
    call_name       TEXT,
    surname         TEXT NOT NULL DEFAULT '',
    suffix          TEXT,
    title_text      TEXT,
    sort_name       TEXT NOT NULL DEFAULT '',        -- "SURNAME Given" for sorting
    primary_name    INTEGER NOT NULL DEFAULT 0       -- 1 = primary name
);

CREATE INDEX IF NOT EXISTS idx_person_name_handle ON person_name (person_handle);

-- -------------------------------------------------------
-- family
-- A family unit (couple ± children).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS family (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    father_handle   TEXT REFERENCES person(handle) ON DELETE SET NULL,
    mother_handle   TEXT REFERENCES person(handle) ON DELETE SET NULL,
    family_type     TEXT NOT NULL DEFAULT 'married',  -- married, unmarried, civil_union, unknown, other
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_family_father ON family (father_handle);
CREATE INDEX IF NOT EXISTS idx_family_mother ON family (mother_handle);

-- -------------------------------------------------------
-- family_child
-- Children in a family.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_child (
    family_handle   TEXT NOT NULL REFERENCES family(handle) ON DELETE CASCADE,
    child_handle    TEXT NOT NULL REFERENCES person(handle) ON DELETE CASCADE,
    father_rel      TEXT NOT NULL DEFAULT 'birth',  -- birth, adopted, step, unknown
    mother_rel      TEXT NOT NULL DEFAULT 'birth',
    PRIMARY KEY (family_handle, child_handle)
);

-- -------------------------------------------------------
-- place
-- Geographic location.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS place (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    title           TEXT NOT NULL DEFAULT '',
    name            TEXT NOT NULL DEFAULT '',
    place_type      TEXT NOT NULL DEFAULT 'unknown',  -- city, county, state, country, parish, ...
    latitude        REAL,
    longitude       REAL,
    code            TEXT,
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_place_name ON place (name);

-- -------------------------------------------------------
-- event
-- A datable, placeable occurrence.
-- event_type values: birth, death, marriage, baptism, burial,
--   divorce, engagement, residence, occupation, education, ...
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS event (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    event_type      TEXT NOT NULL,
    place_handle    TEXT REFERENCES place(handle) ON DELETE SET NULL,
    date_sortval    INTEGER,          -- YYYYMMDD numeric (for ordering)
    date_text       TEXT,             -- human-readable string ("Abt. 1850", "Jan 1900", etc.)
    description     TEXT NOT NULL DEFAULT '',
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_event_type      ON event (event_type);
CREATE INDEX IF NOT EXISTS idx_event_sortval   ON event (date_sortval);

-- -------------------------------------------------------
-- person_event_ref
-- Links a person to an event with an optional role.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS person_event_ref (
    person_handle   TEXT NOT NULL REFERENCES person(handle) ON DELETE CASCADE,
    event_handle    TEXT NOT NULL REFERENCES event(handle) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'primary',  -- primary, witness, informant, ...
    note            TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (person_handle, event_handle)
);

-- -------------------------------------------------------
-- family_event_ref
-- Links a family to an event (e.g., marriage).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_event_ref (
    family_handle   TEXT NOT NULL REFERENCES family(handle) ON DELETE CASCADE,
    event_handle    TEXT NOT NULL REFERENCES event(handle) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'family',
    note            TEXT,
    PRIMARY KEY (family_handle, event_handle)
);

-- -------------------------------------------------------
-- note
-- Arbitrary text attached to any entity.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS note (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    note_type       TEXT NOT NULL DEFAULT 'general',
    text_content    TEXT NOT NULL DEFAULT '',
    format          INTEGER NOT NULL DEFAULT 0,   -- 0=plain, 1=rich
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- -------------------------------------------------------
-- note_ref
-- Polymorphic link from a note to any entity.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS note_ref (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    note_handle     TEXT NOT NULL REFERENCES note(handle) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,    -- 'person' | 'family' | 'event' | 'place'
    entity_handle   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_note_ref_entity ON note_ref (entity_type, entity_handle);

-- -------------------------------------------------------
-- source
-- Bibliographic reference.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS source (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    title           TEXT NOT NULL DEFAULT '',
    author          TEXT NOT NULL DEFAULT '',
    pub_info        TEXT NOT NULL DEFAULT '',
    abbreviation    TEXT NOT NULL DEFAULT '',
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- -------------------------------------------------------
-- citation
-- A reference to a specific part of a source.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS citation (
    handle          TEXT PRIMARY KEY,
    gramps_id       TEXT UNIQUE,
    source_handle   TEXT NOT NULL REFERENCES source(handle) ON DELETE CASCADE,
    date_sortval    INTEGER,
    date_text       TEXT,
    page            TEXT NOT NULL DEFAULT '',
    confidence      INTEGER NOT NULL DEFAULT 0,   -- 0=very_low 1=low 2=normal 3=high 4=very_high
    private         INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- -------------------------------------------------------
-- citation_ref
-- Polymorphic link from a citation to any entity.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS citation_ref (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    citation_handle TEXT NOT NULL REFERENCES citation(handle) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,    -- 'person' | 'family' | 'event' | 'place' | 'name'
    entity_handle   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_citation_ref_entity ON citation_ref (entity_type, entity_handle);

-- -------------------------------------------------------
-- tag
-- User-defined labels with a color, assignable to any entity.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tag (
    handle          TEXT PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    color           TEXT NOT NULL DEFAULT '#6B7280',
    priority        INTEGER NOT NULL DEFAULT 0,
    change_date     INTEGER NOT NULL DEFAULT 0
);

-- -------------------------------------------------------
-- tag_ref
-- Polymorphic link from a tag to any entity.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tag_ref (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_handle      TEXT NOT NULL REFERENCES tag(handle) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,
    entity_handle   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tag_ref_entity ON tag_ref (entity_type, entity_handle);

-- -------------------------------------------------------
-- FTS5 index for person search
-- Indexes given_names + surname from person_name.
-- -------------------------------------------------------
CREATE VIRTUAL TABLE IF NOT EXISTS person_fts USING fts5 (
    person_handle UNINDEXED,
    full_name,
    tokenize = 'unicode61'
);

-- -------------------------------------------------------
-- id_counters
-- Tracks the last-issued Gramps ID number for each entity type.
-- Gramps IDs follow the format: I0001 (person), F0001 (family),
-- E0001 (event), P0001 (place), S0001 (source), C0001 (citation),
-- N0001 (note), T0001 (tag)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS id_counter (
    entity_type     TEXT PRIMARY KEY,
    last_id         INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO id_counter (entity_type, last_id) VALUES
    ('person', 0),
    ('family', 0),
    ('event',  0),
    ('place',  0),
    ('source', 0),
    ('citation', 0),
    ('note',   0),
    ('tag',    0);
