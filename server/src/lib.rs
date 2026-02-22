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
