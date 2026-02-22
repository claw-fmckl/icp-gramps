fn main() {
    ic_asset_router::build::generate_routes();
    ic_sql_migrate::Builder::new()
        .with_migrations_dir("src/migrations")
        .build()
        .unwrap();
}
