use crate::db;
use ic_asset_router::{HttpResponse, RouteContext, StatusCode};
use std::borrow::Cow;

pub fn get(ctx: RouteContext<super::Params>) -> HttpResponse<'static> {
    let handle = &ctx.params.handle;

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
            .with_body(b"{\"error\":\"Person not found\"}" as &[u8])
            .build(),
    }
}

pub fn put(ctx: RouteContext<super::Params>) -> HttpResponse<'static> {
    let handle = &ctx.params.handle;

    let input: db::person::PersonInput = match ctx.json() {
        Ok(input) => input,
        Err(_) => {
            return HttpResponse::builder()
                .with_status_code(StatusCode::BAD_REQUEST)
                .with_headers(vec![(
                    "content-type".to_string(),
                    "application/json".to_string(),
                )])
                .with_body(b"{\"error\":\"Invalid JSON\"}" as &[u8])
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
            .with_body(b"{\"error\":\"Person not found\"}" as &[u8])
            .build(),
    }
}

pub fn delete(ctx: RouteContext<super::Params>) -> HttpResponse<'static> {
    let handle = &ctx.params.handle;

    if db::person::Person::delete(handle) {
        HttpResponse::builder()
            .with_status_code(StatusCode::OK)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(b"{\"success\":true}" as &[u8])
            .build()
    } else {
        HttpResponse::builder()
            .with_status_code(StatusCode::NOT_FOUND)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(b"{\"error\":\"Person not found\"}" as &[u8])
            .build()
    }
}
