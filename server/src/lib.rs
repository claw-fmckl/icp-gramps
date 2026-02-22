mod db;
mod routes;

use ic_asset_router::{HttpRequest, HttpResponse};
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_rusqlite::{close_connection, with_connection, Connection};
use include_dir::{include_dir, Dir};

mod route_tree {
    include!(concat!(env!("OUT_DIR"), "/__route_tree.rs"));
}

static DIST_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../../dist");
static MIGRATIONS: &[ic_sql_migrate::Migration] = ic_sql_migrate::include_migrations!();

fn run_migrations() {
    with_connection(|conn: &mut Connection| {
        ic_sql_migrate::sqlite::migrate(conn, MIGRATIONS).unwrap();
    });
}

fn certify_assets() {
    route_tree::ROUTES.with(|routes| {
        ic_asset_router::setup(routes)
            .with_assets(&DIST_DIR)
            .build();
    });
}

#[init]
fn init() {
    run_migrations();
    certify_assets();
}

#[pre_upgrade]
fn pre_upgrade() {
    close_connection();
}

#[post_upgrade]
fn post_upgrade() {
    run_migrations();
    certify_assets();
}

#[query]
fn http_request(req: HttpRequest) -> HttpResponse<'static> {
    route_tree::ROUTES.with(|routes| ic_asset_router::http_request(req, routes, Default::default()))
}

#[update]
fn http_request_update(req: HttpRequest) -> HttpResponse<'static> {
    route_tree::ROUTES.with(|routes| ic_asset_router::http_request_update(req, routes))
}

// --- Candid API ---

#[query]
fn list_persons() -> Vec<db::person::Person> {
    db::person::Person::list()
}

#[query]
fn get_person(handle: String) -> Option<db::person::Person> {
    db::person::Person::get(&handle)
}

#[update]
async fn create_person(input: db::person::PersonInput) -> Option<db::person::Person> {
    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "person"));
    db::person::Person::create(&handle, &gramps_id, &input)
}

#[update]
fn update_person(handle: String, input: db::person::PersonInput) -> Option<db::person::Person> {
    db::person::Person::update(&handle, &input)
}

#[update]
fn delete_person(handle: String) -> bool {
    db::person::Person::delete(&handle)
}

// --- Event API ---

#[update]
async fn create_event(input: db::event::EventInput) -> Option<db::event::Event> {
    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "event"));
    db::event::Event::create(&handle, &gramps_id, &input)
}

#[update]
fn update_event(handle: String, input: db::event::EventInput) -> Option<db::event::Event> {
    db::event::Event::update(&handle, &input)
}

#[update]
fn delete_event(handle: String) -> bool {
    db::event::Event::delete(&handle)
}

#[query]
fn get_event(handle: String) -> Option<db::event::Event> {
    db::event::Event::get(&handle)
}

/// Create a birth event and link it to a person.
#[update]
async fn set_person_birth(
    person_handle: String,
    input: db::event::EventInput,
) -> Option<db::event::Event> {
    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "event"));
    let event = db::event::Event::create(&handle, &gramps_id, &input)?;
    db::person::set_birth_event(&person_handle, &handle);
    Some(event)
}

/// Create a death event and link it to a person.
#[update]
async fn set_person_death(
    person_handle: String,
    input: db::event::EventInput,
) -> Option<db::event::Event> {
    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "event"));
    let event = db::event::Event::create(&handle, &gramps_id, &input)?;
    db::person::set_death_event(&person_handle, &handle);
    Some(event)
}

/// Get the birth event for a person.
#[query]
fn get_person_birth(person_handle: String) -> Option<db::event::Event> {
    db::person::get_birth_event(&person_handle)
}

/// Get the death event for a person.
#[query]
fn get_person_death(person_handle: String) -> Option<db::event::Event> {
    db::person::get_death_event(&person_handle)
}

// --- Family API ---

#[query]
fn list_families() -> Vec<db::family::Family> {
    db::family::Family::list()
}

#[query]
fn get_family(handle: String) -> Option<db::family::Family> {
    db::family::Family::get(&handle)
}

#[update]
async fn create_family(input: db::family::FamilyInput) -> Option<db::family::Family> {
    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "family"));
    db::family::Family::create(&handle, &gramps_id, &input)
}

#[update]
fn update_family(handle: String, input: db::family::FamilyInput) -> Option<db::family::Family> {
    db::family::Family::update(&handle, &input)
}

#[update]
fn delete_family(handle: String) -> bool {
    db::family::Family::delete(&handle)
}

#[update]
fn add_child_to_family(
    family_handle: String,
    child_handle: String,
    father_rel: String,
    mother_rel: String,
) -> bool {
    db::family::add_child(&family_handle, &child_handle, &father_rel, &mother_rel)
}

#[update]
fn remove_child_from_family(family_handle: String, child_handle: String) -> bool {
    db::family::remove_child(&family_handle, &child_handle)
}

#[query]
fn get_family_children(family_handle: String) -> Vec<db::person::Person> {
    db::family::get_children(&family_handle)
}

#[query]
fn get_person_parent_families(person_handle: String) -> Vec<db::family::Family> {
    db::family::get_parent_families(&person_handle)
}

#[query]
fn get_person_own_families(person_handle: String) -> Vec<db::family::Family> {
    db::family::get_own_families(&person_handle)
}
