# PageSpeed Optimization Plan - 100% Score Target

## Current Performance Scores
- **Mobile**: 32/100 (Critical - needs 68 point improvement)
- **Desktop**: 60/100 (Needs 40 point improvement)
- **Target**: 100/100 for both mobile and desktop

## Critical Performance Issues Analysis

### 1. Render-Blocking Resources (CRITICAL PRIORITY)
**Current Impact:**
- Mobile: 2,340ms delay (Score: 0/100)
- Desktop: 1,210ms delay (Score: 0/100)

**Issues Identified:**
- External Google Fonts (render-blocking): `fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`
- External Three.js CDN: `unpkg.com/three@0.158.0/build/three.module.js` (250KB)
- External GSAP CDNs: 3 separate requests to `cdnjs.cloudflare.com`
- CSS file: `style-CMFKM6IP.css` (render-blocking)

**Solutions:**
1. Self-host Google Fonts with font-display: swap
2. Bundle Three.js locally instead of CDN
3. Bundle GSAP locally instead of CDN
4. Inline critical CSS, defer non-critical CSS
5. Use resource hints (preload, prefetch)

### 2. Unused JavaScript (HIGH PRIORITY)
**Current Impact:**
- Mobile: 200KB unused code, 880ms potential savings
- Desktop: 200KB unused code

**Issues Identified:**
- `three.module.js` (250KB) - likely only using subset
- Multiple legacy browser files loaded unnecessarily
- WASM files may have unused portions
- Multiple JavaScript files with overlapping functionality

**Solutions:**
1. Tree-shake Three.js - only import used modules
2. Remove legacy browser support files for modern browsers
3. Code-split JavaScript - load only what's needed per section
4. Remove unused WASM functionality
5. Bundle and minify all JavaScript

### 3. Image Optimization (HIGH PRIORITY)
**Current Impact:**
- Mobile: 156KB savings, 900ms potential improvement
- Multiple large PNG files

**Issues Identified:**
- `logo.png` (196KB) - largest impact
- `android-chrome-192x192.png` (47KB)
- All favicon PNGs can be optimized
- No modern image formats (WebP/AVIF)

**Solutions:**
1. Convert all images to WebP format
2. Provide AVIF as first choice with WebP fallback
3. Optimize PNG images as final fallback
4. Implement responsive images with srcset
5. Lazy load non-critical images

### 4. Cache Policy Issues (MEDIUM PRIORITY)
**Current Impact:**
- 151KB wasted due to short cache times
- All static assets using 4-hour cache

**Issues Identified:**
- Static assets should have longer cache times (1 year)
- No proper cache-busting strategy
- Images, CSS, JS using same short cache policy

**Solutions:**
1. Implement long-term caching (31536000 seconds = 1 year)
2. Use proper cache-busting with file hashes
3. Set different cache policies per asset type
4. Configure Rust server cache headers properly

### 5. Core Web Vitals Issues (HIGH PRIORITY)

**First Contentful Paint (FCP):**
- Mobile: 4.0s (Target: <1.8s) - Need 2.2s improvement
- Desktop: Better but can be optimized

**Largest Contentful Paint (LCP):**
- Mobile: 5.9s (Target: <2.5s) - Need 3.4s improvement
- Desktop: 1.6s (Target: <2.5s) - Close but needs optimization

**Total Blocking Time (TBT):**
- Mobile: 4,110ms (Target: <200ms) - CRITICAL
- Large JavaScript files blocking main thread

**Cumulative Layout Shift (CLS):**
- Mobile: 0.081 (Good - score 0.94)
- Desktop: Lower CLS

**Solutions:**
1. Prioritize above-the-fold content loading
2. Optimize LCP element (hero section)
3. Reduce JavaScript execution time
4. Implement progressive loading strategy

## Detailed Execution Plan

### Phase 1: Eliminate Render-Blocking Resources
1. **Self-host Google Fonts**
   - Download Inter font files (woff2 format)
   - Add to static/fonts/ directory
   - Update CSS with font-display: swap
   - Remove external font link

2. **Bundle External JavaScript Libraries**
   - Download Three.js and save locally
   - Download GSAP files and save locally
   - Update import paths in HTML
   - Remove external CDN links

3. **Optimize CSS Loading**
   - Identify critical CSS for above-the-fold content
   - Inline critical CSS in HTML head
   - Load non-critical CSS asynchronously
   - Use media queries for conditional CSS loading

### Phase 2: JavaScript Optimization
1. **Tree-shake Three.js**
   - Identify exact Three.js modules being used
   - Create custom Three.js bundle with only needed modules
   - Replace full Three.js import with selective imports

2. **Remove Unused Code**
   - Analyze each JavaScript file for usage
   - Remove legacy browser support for modern browsers
   - Remove unused WASM functionality
   - Remove duplicate functionality across files

3. **Code Splitting and Lazy Loading**
   - Split JavaScript by functionality
   - Load hero section JS immediately
   - Lazy load skills visualization JS
   - Lazy load Three.js scene JS

### Phase 3: Image Optimization
1. **Convert to Modern Formats**
   - Convert all PNG images to WebP
   - Generate AVIF versions for maximum compression
   - Keep PNG as fallback for older browsers
   - Use picture element with multiple sources

2. **Implement Responsive Images**
   - Create multiple sizes for each image
   - Use srcset for different screen densities
   - Implement lazy loading for non-critical images
   - Optimize image dimensions for actual usage

### Phase 4: Caching and Server Optimization
1. **Configure Cache Headers**
   - Static assets: 1 year cache with ETags
   - HTML: No cache or short cache
   - Images: Long cache with proper ETags
   - Implement cache invalidation strategy

2. **Server-Side Optimizations**
   - Enable gzip/brotli compression
   - Implement HTTP/2 server push for critical resources
   - Add proper security headers
   - Optimize server response times

### Phase 5: Advanced Optimizations
1. **Resource Preloading**
   - Preload critical fonts
   - Preload critical JavaScript modules
   - Prefetch next-section resources
   - DNS prefetch for any remaining external resources

2. **Service Worker Optimization**
   - Cache critical resources
   - Implement offline fallbacks
   - Precache next-page resources
   - Update caching strategy

## Implementation Priority Order

### Immediate (Day 1) - High Impact Changes
1. ✅ Self-host Google Fonts with font-display: swap
2. ✅ Bundle Three.js and GSAP locally
3. ✅ Remove external CDN dependencies
4. ✅ Optimize critical CSS loading

### Day 2 - JavaScript Optimization
1. ✅ Tree-shake Three.js imports
2. ✅ Remove unused JavaScript code
3. ✅ Implement code splitting
4. ✅ Optimize WASM loading

### Day 3 - Image and Caching
1. ✅ Convert images to WebP/AVIF
2. ✅ Implement responsive images
3. ✅ Configure proper cache headers
4. ✅ Add image lazy loading

### Day 4 - Fine-tuning and Testing
1. ✅ Test on mobile and desktop
2. ✅ Verify all Core Web Vitals
3. ✅ Ensure 100% scores achieved
4. ✅ Performance regression testing

## Success Criteria
- **Mobile PageSpeed**: 100/100 (currently 32/100)
- **Desktop PageSpeed**: 100/100 (currently 60/100)
- **FCP**: <1.8s (currently 4.0s mobile)
- **LCP**: <2.5s (currently 5.9s mobile)
- **TBT**: <200ms (currently 4,110ms mobile)
- **CLS**: <0.1 (currently 0.081 - good)

## File Changes Required

### Templates
- `templates/index.html.tera` - Major updates for resource loading

### Static Assets
- `static/fonts/` - New directory for self-hosted fonts
- `static/css/` - CSS optimization and critical CSS
- `static/js/` - JavaScript bundling and optimization
- `static/images/` - WebP/AVIF conversion and optimization

### Server Configuration
- `src/handlers/` - Cache header configuration
- `src/services/assets.rs` - Asset serving optimization
- `Rocket.toml` - Server configuration updates

### Build Process
- New build scripts for asset optimization
- Image conversion pipeline
- JavaScript bundling process
- CSS optimization pipeline

## Monitoring and Validation
- Use PageSpeed Insights for validation
- Monitor Core Web Vitals in production
- Set up performance budgets
- Implement performance regression tests