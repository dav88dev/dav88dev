# Modern multi-stage Dockerfile for Rust web application
# Using Docker best practices for 2025

# Stage 1: Frontend builder
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Skip WASM building - use pre-built from build.sh

# Stage 3: Rust builder with cargo-chef for optimal caching
FROM lukemathwalker/cargo-chef:latest-rust-1.83-alpine AS chef
WORKDIR /build

FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS backend
RUN apk add --no-cache musl-dev
COPY --from=planner /build/recipe.json recipe.json
# Build dependencies - this is cached
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json

# Build application
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo build --release --target x86_64-unknown-linux-musl && \
    strip target/x86_64-unknown-linux-musl/release/personal_website

# Stage 4: Final runtime
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata && \
    adduser -D -u 1000 web

WORKDIR /app

# Copy artifacts from build stages
COPY --from=backend --chown=web:web /build/target/x86_64-unknown-linux-musl/release/personal_website ./
COPY --chown=web:web templates/ ./templates

# Copy all static files (includes everything)
COPY --chown=web:web static/ ./static/
# Overlay frontend build outputs
COPY --from=frontend --chown=web:web /static ./static

USER web
EXPOSE 8000

# Optimized for Axum/Tokio async runtime
ENV RUST_LOG=info \
    HOST=0.0.0.0 \
    PORT=8000 \
    TOKIO_WORKER_THREADS=1 \
    TOKIO_BLOCKING_THREADS=1

# Health check with retries for async startup
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -nv -t1 -O- http://127.0.0.1:8000/health || exit 1

# Use exec form for proper signal handling with Tokio
ENTRYPOINT ["./personal_website"]