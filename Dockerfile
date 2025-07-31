# Multi-stage Dockerfile for Rust web application with WASM frontend
# Optimized for production deployment

# Stage 1: WASM Builder
FROM rust:1.83-alpine AS wasm-builder
RUN apk add --no-cache curl musl-dev
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
WORKDIR /wasm
COPY wasm-frontend/ ./
RUN wasm-pack build --target web --out-dir ../static/wasm

# Stage 2: Frontend Builder  
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Rust Builder
FROM rust:1.83-alpine AS rust-builder
RUN apk add --no-cache musl-dev
WORKDIR /build
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 4: Final Runtime Image
FROM alpine:3.20
RUN apk --no-cache add ca-certificates tzdata && \
    adduser -D -u 1001 -s /bin/sh portfolio
WORKDIR /app

# Copy Rust binary
COPY --from=rust-builder --chown=portfolio:portfolio /build/target/x86_64-unknown-linux-musl/release/personal_website ./

# Copy static assets and templates
COPY --chown=portfolio:portfolio templates/ ./templates/
COPY --chown=portfolio:portfolio static/ ./static/

# Copy WASM assets from wasm-builder
COPY --from=wasm-builder --chown=portfolio:portfolio /static/wasm ./static/wasm/

# Copy frontend build outputs (this will overlay existing static files)
COPY --from=frontend-builder --chown=portfolio:portfolio /static ./static/

# Switch to non-root user
USER portfolio

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Set environment variables
ENV RUST_LOG=info

# Run the application
ENTRYPOINT ["./personal_website"]