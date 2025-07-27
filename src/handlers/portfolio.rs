use crate::models::CVData;
use crate::services::AssetPaths;
use axum::{
    extract::Extension,
    http::StatusCode,
    response::{Html, Json, Response},
};
use serde_json::json;
use std::sync::Arc;
use tera::{Context, Tera};

pub async fn index(
    Extension(templates): Extension<Arc<Tera>>,
    Extension(cv_data): Extension<Arc<CVData>>,
    Extension(asset_paths): Extension<Arc<AssetPaths>>,
) -> Result<Html<String>, StatusCode> {
    let mut context = Context::new();
    context.insert("cv_data", cv_data.as_ref());
    context.insert("assets", asset_paths.as_ref());

    templates
        .render("index.html.tera", &context)
        .map(Html)
        .map_err(|err| {
            tracing::error!("Template rendering error: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })
}

pub async fn robots_txt() -> Response<String> {
    let content = r#"User-agent: *
Allow: /

Sitemap: https://dav88.dev/sitemap.xml"#;

    Response::builder()
        .status(StatusCode::OK)
        .header("content-type", "text/plain")
        .body(content.to_string())
        .unwrap()
}

pub async fn sitemap_xml() -> Response<String> {
    let content = r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://dav88.dev/</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://dav88.dev/api/cv</loc>
        <lastmod>2025-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>"#;

    Response::builder()
        .status(StatusCode::OK)
        .header("content-type", "application/xml")
        .body(content.to_string())
        .unwrap()
}

pub async fn manifest_json() -> Json<serde_json::Value> {
    Json(json!({
        "name": "David Aghayan - Elite Software Engineer",
        "short_name": "DAV88DEV",
        "description": "Elite Senior Software Engineer & Site Reliability Engineer",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#6366f1",
        "icons": [
            {
                "src": "/static/images/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/static/images/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }))
}
