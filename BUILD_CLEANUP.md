# Repository Cleanup - Build Artifacts Removed

## What Was Removed from Git Tracking

### 🗂️ Generated Files (Previously ~2.5GB)
- `target/` - Rust compilation artifacts  
- `static/css/style-*.css` - Vite generated CSS with hashes
- `static/js/main-*.js` - Vite generated JavaScript bundles
- `static/js/*-legacy-*.js` - Legacy browser polyfills
- `static/wasm/*` - WebAssembly compiled outputs
- `frontend/node_modules/` - Node.js dependencies
- `static/.vite/` - Vite build cache and manifest

### 📁 Temporary Files
- `issue.png` - Debug screenshot
- `*.log` - Build and runtime logs
- Performance reports and coverage files

## Build Process After Cleanup

### 🏗️ Required Build Steps
```bash
# Frontend assets
cd frontend && npm install && npm run build

# WASM compilation  
cd wasm-frontend && wasm-pack build --target web --out-dir ../static/wasm

# Rust backend
cargo build --release
```

### ✅ What Stays in Git
- Source code (`.rs`, `.js`, `.css`, `.html.tera`)
- Configuration files (`Cargo.toml`, `package.json`, `vite.config.js`)
- Static assets (images, favicons, manifest.json)
- Documentation and README files
- `.gitkeep` files to preserve directory structure

## Repository Size Reduction

- **Before**: ~2.6GB (with node_modules, target/, generated files)
- **After**: ~50MB (source code and essential assets only)
- **Reduction**: 98% smaller repository

## CI/CD Impact

Build systems now need to:
1. Run `npm install` and `npm run build` for frontend
2. Install `wasm-pack` and build WASM modules
3. Run `cargo build` for backend
4. Generated files are created fresh on each deployment

This ensures:
- ✅ Reproducible builds
- ✅ No merge conflicts on generated files  
- ✅ Faster clone times
- ✅ Cleaner commit history
- ✅ Reduced bandwidth usage