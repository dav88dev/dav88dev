use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub static_dir: String,
    pub templates_dir: String,
    pub database_url: Option<String>,
    pub environment: Environment,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Environment {
    Development,
    Production,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8000".to_string())
                .parse()
                .expect("PORT must be a valid number"),
            static_dir: env::var("STATIC_DIR").unwrap_or_else(|_| "static".to_string()),
            templates_dir: env::var("TEMPLATES_DIR").unwrap_or_else(|_| "templates".to_string()),
            database_url: env::var("DATABASE_URL").ok(),
            environment: match env::var("ENVIRONMENT").as_deref() {
                Ok("production") => Environment::Production,
                _ => Environment::Development,
            },
        }
    }

    pub fn is_development(&self) -> bool {
        self.environment == Environment::Development
    }

    pub fn bind_address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}