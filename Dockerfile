# Multi-stage build for optimal image size and security
FROM node:18-alpine AS frontend-builder

# Install frontend dependencies and build assets
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Rust builder stage
FROM rust:1.75-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache \
    musl-dev \
    openssl-dev \
    pkgconfig

# Create app directory
WORKDIR /app

# Copy Cargo files for dependency caching
COPY Cargo.toml Cargo.lock ./
COPY src/ src/

# Copy frontend build artifacts
COPY --from=frontend-builder /app/static ./static
COPY templates/ templates/

# Build the Rust application in release mode
RUN cargo build --release --target x86_64-unknown-linux-musl

# Runtime stage - minimal Alpine image
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=backend-builder /app/target/x86_64-unknown-linux-musl/release/personal_website /app/portfolio
COPY --from=backend-builder /app/templates ./templates
COPY --from=backend-builder /app/static ./static

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Set environment variables
ENV RUST_LOG=info
ENV HOST=0.0.0.0
ENV PORT=8000
ENV STATIC_DIR=./static
ENV TEMPLATE_DIR=./templates

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run the application
CMD ["./portfolio"]