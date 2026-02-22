use crate::db;
use ic_asset_router::{HttpResponse, RouteContext, StatusCode};
use ic_rusqlite::with_connection;
use std::borrow::Cow;

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    let persons = db::person::Person::list();
    let json = serde_json::to_vec(&persons).unwrap_or_default();

    HttpResponse::builder()
        .with_status_code(StatusCode::OK)
        .with_headers(vec![(
            "content-type".to_string(),
            "application/json".to_string(),
        )])
        .with_body(Cow::Owned(json))
        .build()
}

pub async fn post(ctx: RouteContext<()>) -> HttpResponse<'static> {
    let input: db::person::PersonInput = match ctx.json() {
        Ok(input) => input,
        Err(_) => {
            return HttpResponse::builder()
                .with_status_code(StatusCode::BAD_REQUEST)
                .with_headers(vec![(
                    "content-type".to_string(),
                    "application/json".to_string(),
                )])
                .with_body(Cow::Borrowed(b"{\"error\":\"Invalid JSON\"}"))
                .build();
        }
    };

    let handle = db::new_handle().await;
    let gramps_id = with_connection(|conn| db::next_gramps_id(conn, "person"));

    match db::person::Person::create(&handle, &gramps_id, &input) {
        Some(person) => {
            let json = serde_json::to_vec(&person).unwrap_or_default();
            HttpResponse::builder()
                .with_status_code(StatusCode::OK)
                .with_headers(vec![(
                    "content-type".to_string(),
                    "application/json".to_string(),
                )])
                .with_body(Cow::Owned(json))
                .build()
        }
        None => HttpResponse::builder()
            .with_status_code(StatusCode::INTERNAL_SERVER_ERROR)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(b"{\"error\":\"Failed to create person\"}"))
            .build(),
    }
}
