// Database service module - prepared for SurrealDB integration
//
// This module will handle database operations when we add SurrealDB later.
// For now, it contains the structure and interfaces for future implementation.

use crate::models::{BlogPost, CreateBlogPost};
use anyhow::Result;

#[allow(async_fn_in_trait)]
pub trait BlogRepository {
    async fn get_all_posts(&self) -> Result<Vec<BlogPost>>;
    async fn get_post_by_id(&self, id: uuid::Uuid) -> Result<Option<BlogPost>>;
    async fn get_post_by_slug(&self, slug: &str) -> Result<Option<BlogPost>>;
    async fn create_post(&self, post: CreateBlogPost) -> Result<BlogPost>;
    async fn update_post(&self, id: uuid::Uuid, post: CreateBlogPost) -> Result<Option<BlogPost>>;
    async fn delete_post(&self, id: uuid::Uuid) -> Result<bool>;
    async fn get_published_posts(&self) -> Result<Vec<BlogPost>>;
}

// Future SurrealDB implementation
//
// When ready to add database:
// 1. Add surrealdb dependency to Cargo.toml
// 2. Implement SurrealDbRepository struct
// 3. Add database initialization to main.rs
// 4. Update handlers to use database
//
// Example dependency for Cargo.toml:
// surrealdb = { version = "1.0", features = ["kv-rocksdb"] }
//
// For embedded usage (perfect for 512MB server):
// let db = surrealdb::Surreal::new::<surrealdb::engine::local::Db>(path).await?;
//
// For remote usage (when scaling later):
// let db = surrealdb::Surreal::new::<surrealdb::engine::remote::ws::Ws>("127.0.0.1:8000").await?;

#[allow(dead_code)]
pub struct InMemoryBlogRepository {
    // Placeholder for development/testing
}

#[allow(dead_code)]
impl Default for InMemoryBlogRepository {
    fn default() -> Self {
        Self::new()
    }
}

impl InMemoryBlogRepository {
    pub fn new() -> Self {
        Self {}
    }
}

// Placeholder implementation for future use
impl BlogRepository for InMemoryBlogRepository {
    async fn get_all_posts(&self) -> Result<Vec<BlogPost>> {
        Ok(vec![])
    }

    async fn get_post_by_id(&self, _id: uuid::Uuid) -> Result<Option<BlogPost>> {
        Ok(None)
    }

    async fn get_post_by_slug(&self, _slug: &str) -> Result<Option<BlogPost>> {
        Ok(None)
    }

    async fn create_post(&self, _post: CreateBlogPost) -> Result<BlogPost> {
        anyhow::bail!("Not implemented - database required")
    }

    async fn update_post(
        &self,
        _id: uuid::Uuid,
        _post: CreateBlogPost,
    ) -> Result<Option<BlogPost>> {
        Ok(None)
    }

    async fn delete_post(&self, _id: uuid::Uuid) -> Result<bool> {
        Ok(false)
    }

    async fn get_published_posts(&self) -> Result<Vec<BlogPost>> {
        Ok(vec![])
    }
}
