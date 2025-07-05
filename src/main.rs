use axum::{
    extract::Extension,
    routing::{get, get_service},
    Router,
};
use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Import our modules
use personal_website::{
    config::AppConfig,
    models::CVData,
    handlers::{
        index, robots_txt, sitemap_xml, manifest_json,
        get_cv_data, get_cv_json,
        health_check, readiness_check,
        https_redirect_middleware, security_headers_middleware,
    },
    services::{template::create_template_engine, load_asset_paths},
};

#[tokio::main(flavor = "current_thread")]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing for observability
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "personal_website=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = AppConfig::from_env();
    tracing::info!("Starting server with config: {:?}", config);

    // Initialize template engine
    let templates = create_template_engine(&config)?;
    tracing::info!("Template engine initialized");

    // Initialize application data
    let cv_data = Arc::new(CVData::default());
    tracing::info!("CV data loaded");

    // Load asset paths from Vite manifest
    let asset_paths = Arc::new(load_asset_paths(&config.static_dir)?);
    tracing::info!("Asset paths loaded");

    // Build the application with middleware
    let app = create_app(templates, cv_data, asset_paths, &config).await?;

    // Create TCP listener
    let listener = tokio::net::TcpListener::bind(&config.bind_address()).await?;
    tracing::info!("🚀 Server running on http://{}", config.bind_address());
    tracing::info!("📊 Health check: http://{}/health", config.bind_address());
    tracing::info!("🎯 API endpoint: http://{}/api/cv", config.bind_address());

    // Start the server with graceful shutdown and HTTP/2 support
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn create_app(
    templates: Arc<tera::Tera>,
    cv_data: Arc<CVData>,
    asset_paths: Arc<personal_website::services::AssetPaths>,
    config: &AppConfig,
) -> anyhow::Result<Router> {
    // Static file service
    let serve_dir = get_service(ServeDir::new(&config.static_dir))
        .handle_error(|error| async move {
            tracing::error!("Static file error: {}", error);
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Unhandled internal error: {error}"),
            )
        });

    // Middleware stack optimized for single-threaded performance
    let middleware = ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(CorsLayer::permissive()) // Configure as needed
        .layer(axum::middleware::from_fn(security_headers_middleware))
        .layer(axum::middleware::from_fn(https_redirect_middleware))
        .layer(Extension(templates))
        .layer(Extension(cv_data))
        .layer(Extension(asset_paths));

    // Build routes
    let app = Router::new()
        // Portfolio routes
        .route("/", get(index))
        .route("/robots.txt", get(robots_txt))
        .route("/sitemap.xml", get(sitemap_xml))
        .route("/manifest.json", get(manifest_json))
        
        // API routes
        .nest("/api", 
            Router::new()
                .route("/cv", get(get_cv_data))
                .route("/cv.json", get(get_cv_json))
                // Future blog routes
                // .route("/blog", get(get_blog_posts))
                // .route("/blog", post(create_blog_post))
        )
        
        // Health check routes
        .route("/health", get(health_check))
        .route("/ready", get(readiness_check))
        
        // Static files
        .nest_service("/static", serve_dir)
        
        // Apply middleware
        .layer(middleware);

    Ok(app)
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received Ctrl+C, shutting down gracefully");
        },
        _ = terminate => {
            tracing::info!("Received SIGTERM, shutting down gracefully");
        },
    }
}