use crate::db;
use ic_asset_router::{HttpResponse, RouteContext, StatusCode};
use std::borrow::Cow;

pub fn get(ctx: RouteContext<()>) -> HttpResponse<'static> {
    let handle = ctx.params.get("handle").unwrap_or("");

    match db::person::Person::get(handle) {
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
            .with_status_code(StatusCode::NOT_FOUND)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(b"{\"error\":\"Person not found\"}"))
            .build(),
    }
}

pub fn put(ctx: RouteContext<()>) -> HttpResponse<'static> {
    let handle = ctx.params.get("handle").unwrap_or("");

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

    match db::person::Person::update(handle, &input) {
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
            .with_status_code(StatusCode::NOT_FOUND)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(b"{\"error\":\"Person not found\"}"))
            .build(),
    }
}

pub fn delete(ctx: RouteContext<()>) -> HttpResponse<'static> {
    let handle = ctx.params.get("handle").unwrap_or("");

    if db::person::Person::delete(handle) {
        HttpResponse::builder()
            .with_status_code(StatusCode::OK)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(b"{\"success\":true}"))
            .build()
    } else {
        HttpResponse::builder()
            .with_status_code(StatusCode::NOT_FOUND)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(b"{\"error\":\"Person not found\"}"))
            .build()
    }
}
