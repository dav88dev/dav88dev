# Multi-stage Dockerfile for Go web application with WASM frontend
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

# Stage 3: Go Builder
FROM golang:1.24-alpine AS go-builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o portfolio-server .

# Stage 4: Final Runtime Image
FROM alpine:3.20
RUN apk --no-cache add ca-certificates tzdata wget && \
    adduser -D -u 1001 -s /bin/sh portfolio
WORKDIR /app

# Copy Go binary
COPY --from=go-builder --chown=portfolio:portfolio /build/portfolio-server ./

# Copy static assets and templates
COPY --chown=portfolio:portfolio templates/ ./templates/
COPY --chown=portfolio:portfolio static/ ./static/

# Copy WASM assets from wasm-builder
COPY --from=wasm-builder --chown=portfolio:portfolio /static/wasm ./static/wasm/

# Copy frontend build outputs (this will overlay existing static files)
COPY --from=frontend-builder --chown=portfolio:portfolio /frontend/dist ./static/

# Switch to non-root user
USER portfolio

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Set environment variables
ENV SERVER_ENV=production
ENV SERVER_PORT=8000

# Run the application
ENTRYPOINT ["./portfolio-server"]