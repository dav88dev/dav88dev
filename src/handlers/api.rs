use crate::models::{ApiResponse, CVData};
use axum::{extract::Extension, http::StatusCode, response::Json};
use std::sync::Arc;

pub async fn get_cv_data(
    Extension(cv_data): Extension<Arc<CVData>>,
) -> Result<Json<ApiResponse<CVData>>, StatusCode> {
    Ok(Json(ApiResponse::success(cv_data.as_ref().clone())))
}

pub async fn get_cv_json(
    Extension(cv_data): Extension<Arc<CVData>>,
) -> Result<Json<CVData>, StatusCode> {
    Ok(Json(cv_data.as_ref().clone()))
}

// Future blog endpoints (ready for implementation)
/*
pub async fn get_blog_posts() -> Result<Json<ApiResponse<Vec<BlogPost>>>, StatusCode> {
    // TODO: Implement with database
    Ok(Json(ApiResponse::success(vec![])))
}

pub async fn create_blog_post(
    Json(payload): Json<CreateBlogPost>,
) -> Result<Json<ApiResponse<BlogPost>>, StatusCode> {
    // TODO: Implement with database
    Err(StatusCode::NOT_IMPLEMENTED)
}
*/
