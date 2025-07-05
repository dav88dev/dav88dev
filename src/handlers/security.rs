use axum::{
    extract::Request,
    http::{header::HeaderMap, StatusCode, Uri},
    middleware::Next,
    response::{IntoResponse, Redirect, Response},
};

/// Middleware to enforce HTTPS in production
pub async fn https_redirect_middleware(
    uri: Uri,
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Check if we should enforce HTTPS (this would be set via config)
    let should_force_https = std::env::var("HTTPS_ENABLED")
        .unwrap_or_else(|_| "false".to_string())
        .parse()
        .unwrap_or(false);

    if should_force_https {
        // Check if request is already HTTPS
        let is_https = headers
            .get("x-forwarded-proto")
            .and_then(|v| v.to_str().ok())
            .map(|v| v == "https")
            .unwrap_or_else(|| {
                // Fallback: check the scheme
                uri.scheme_str() == Some("https")
            });

        if !is_https {
            // Construct HTTPS URL
            let host = headers
                .get("host")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("localhost");
            
            let https_url = format!("https://{}{}", host, uri.path_and_query().map(|pq| pq.as_str()).unwrap_or(""));
            
            return Ok(Redirect::permanent(&https_url).into_response());
        }
    }

    Ok(next.run(request).await)
}

/// Add security headers middleware
pub async fn security_headers_middleware(
    request: Request,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;
    
    let headers = response.headers_mut();
    
    // HSTS (HTTP Strict Transport Security)
    headers.insert("strict-transport-security", "max-age=31536000; includeSubDomains".parse().unwrap());
    
    // X-Content-Type-Options
    headers.insert("x-content-type-options", "nosniff".parse().unwrap());
    
    // X-Frame-Options
    headers.insert("x-frame-options", "DENY".parse().unwrap());
    
    // X-XSS-Protection
    headers.insert("x-xss-protection", "1; mode=block".parse().unwrap());
    
    // Referrer Policy
    headers.insert("referrer-policy", "strict-origin-when-cross-origin".parse().unwrap());
    
    // Content Security Policy
    headers.insert(
        "content-security-policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'".parse().unwrap()
    );
    
    response
}