use axum::{
    extract::Path,
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use std::path::PathBuf;
use tokio::fs;

/// Custom static file handler with optimized cache headers
pub async fn serve_static_file(Path(path): Path<String>) -> Response {
    let static_dir = std::env::var("STATIC_DIR").unwrap_or_else(|_| "static".to_string());
    let file_path = PathBuf::from(&static_dir).join(&path);

    // Security check - prevent directory traversal
    if !file_path.starts_with(&static_dir) {
        return (StatusCode::FORBIDDEN, "Access denied").into_response();
    }

    // Check if file exists
    let file_content = match fs::read(&file_path).await {
        Ok(content) => content,
        Err(_) => return (StatusCode::NOT_FOUND, "File not found").into_response(),
    };

    // Determine content type and cache policy based on file extension
    let (content_type, cache_control) = get_content_type_and_cache(&path);

    // Build response headers
    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, content_type.parse().unwrap());
    headers.insert(header::CACHE_CONTROL, cache_control.parse().unwrap());
    
    // Add security headers
    headers.insert("X-Content-Type-Options", "nosniff".parse().unwrap());
    
    // Add ETags for better caching
    let etag = format!("\"{:x}\"", md5::compute(&file_content));
    headers.insert(header::ETAG, etag.parse().unwrap());

    (headers, file_content).into_response()
}

fn get_content_type_and_cache(path: &str) -> (&'static str, &'static str) {
    let extension = std::path::Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    match extension {
        // Images - long cache (1 year) with immutable
        "webp" => ("image/webp", "public, max-age=31536000, immutable"),
        "png" => ("image/png", "public, max-age=31536000, immutable"),
        "jpg" | "jpeg" => ("image/jpeg", "public, max-age=31536000, immutable"),
        "svg" => ("image/svg+xml", "public, max-age=31536000, immutable"),
        "ico" => ("image/x-icon", "public, max-age=31536000, immutable"),
        
        // CSS/JS - long cache with versioning
        "css" => ("text/css; charset=utf-8", "public, max-age=31536000, immutable"),
        "js" => ("application/javascript; charset=utf-8", "public, max-age=31536000, immutable"),
        "mjs" => ("application/javascript; charset=utf-8", "public, max-age=31536000, immutable"),
        
        // Fonts - very long cache
        "woff2" => ("font/woff2", "public, max-age=31536000, immutable"),
        "woff" => ("font/woff", "public, max-age=31536000, immutable"),
        "ttf" => ("font/ttf", "public, max-age=31536000, immutable"),
        "otf" => ("font/otf", "public, max-age=31536000, immutable"),
        
        // WASM files
        "wasm" => ("application/wasm", "public, max-age=31536000, immutable"),
        
        // Manifests and other config files - short cache
        "json" => ("application/json; charset=utf-8", "public, max-age=3600"),
        "xml" => ("application/xml; charset=utf-8", "public, max-age=3600"),
        "txt" => ("text/plain; charset=utf-8", "public, max-age=3600"),
        "webmanifest" => ("application/manifest+json", "public, max-age=3600"),
        
        // Default - no cache for security
        _ => ("application/octet-stream", "public, max-age=3600"),
    }
}