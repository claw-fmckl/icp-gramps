use ic_asset_router::{HttpResponse, RouteContext, StatusCode};
use std::borrow::Cow;

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    let html = include_str!("../../dist/index.html");
    HttpResponse::builder()
        .with_status_code(StatusCode::OK)
        .with_headers(vec![(
            "content-type".to_string(),
            "text/html; charset=utf-8".to_string(),
        )])
        .with_body(Cow::<[u8]>::Owned(html.as_bytes().to_vec()))
        .build()
}
