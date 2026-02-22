fn main() {
    ic_asset_router::build::generate_routes();
    ic_sql_migrate::build::generate_migrations("src/migrations").unwrap();
}
