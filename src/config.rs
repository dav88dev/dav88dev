use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub static_dir: String,
    pub templates_dir: String,
    pub database_url: Option<String>,
    pub environment: Environment,
    pub https_enabled: bool,
    pub https_port: u16,
    pub cert_path: Option<String>,
    pub key_path: Option<String>,
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
            https_enabled: env::var("HTTPS_ENABLED")
                .unwrap_or_else(|_| "false".to_string())
                .parse()
                .unwrap_or(false),
            https_port: env::var("HTTPS_PORT")
                .unwrap_or_else(|_| "8443".to_string())
                .parse()
                .expect("HTTPS_PORT must be a valid number"),
            cert_path: env::var("SSL_CERT_PATH").ok(),
            key_path: env::var("SSL_KEY_PATH").ok(),
        }
    }

    pub fn is_development(&self) -> bool {
        self.environment == Environment::Development
    }

    pub fn bind_address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    pub fn https_bind_address(&self) -> String {
        format!("{}:{}", self.host, self.https_port)
    }

    pub fn should_force_https(&self) -> bool {
        self.environment == Environment::Production && self.https_enabled
    }
}