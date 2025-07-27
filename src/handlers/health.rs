use axum::{http::StatusCode, response::Json};
use chrono::Utc;
use serde_json::json;

pub async fn health_check() -> Result<Json<serde_json::Value>, StatusCode> {
    Ok(Json(json!({
        "status": "healthy",
        "timestamp": Utc::now(),
        "version": env!("CARGO_PKG_VERSION"),
        "name": env!("CARGO_PKG_NAME")
    })))
}

pub async fn readiness_check() -> Result<Json<serde_json::Value>, StatusCode> {
    // Future: Add database connectivity checks here
    Ok(Json(json!({
        "status": "ready",
        "timestamp": Utc::now(),
        "checks": {
            "database": "not_configured",
            "filesystem": "ok"
        }
    })))
}
