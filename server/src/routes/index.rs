use ic_asset_router::{route, HttpResponse, RouteContext, StatusCode};

#[route(certification = "skip")]
pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    // Serve index.html directly with skip certification for the root path
    let html = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/../dist/index.html"));
    HttpResponse::builder()
        .with_status_code(StatusCode::OK)
        .with_headers(vec![(
            "content-type".to_string(),
            "text/html; charset=utf-8".to_string(),
        )])
        .with_body(html.as_bytes())
        .build()
}
