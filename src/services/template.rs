use crate::config::AppConfig;
use anyhow::Result;
use std::sync::Arc;
use tera::Tera;

pub fn create_template_engine(config: &AppConfig) -> Result<Arc<Tera>> {
    let template_glob = format!("{}/**/*.tera", config.templates_dir);

    let mut tera = match Tera::new(&template_glob) {
        Ok(t) => t,
        Err(e) => {
            tracing::error!("Template parsing error: {}", e);
            return Err(e.into());
        }
    };

    // Enable auto-reload in development
    if config.is_development() {
        tera.autoescape_on(vec![".html", ".htm", ".xml"]);
        tracing::info!("Template auto-reload enabled for development");
    }

    Ok(Arc::new(tera))
}
