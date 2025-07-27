pub mod api;
pub mod health;
pub mod portfolio;
pub mod static_files;

// Re-export handlers
pub use api::*;
pub use health::*;
pub use portfolio::*;
pub use static_files::*;
