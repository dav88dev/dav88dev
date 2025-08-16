# 🔥 HOLY LAWS FOR CLAUDE - CARVED IN STONE 🔥

## ⚡ MANDATORY TESTING COMMANDMENTS ⚡

### 🚨 THOU SHALL ALWAYS TEST BEFORE CLAIMING VICTORY 🚨

**EVERY TIME you make ANY change to this codebase, you MUST run the comprehensive test suite:**

```bash
./test_everything.sh
```

This is **NON-NEGOTIABLE**. No exceptions. No shortcuts. NO MERCY.

### 🔧 Testing Requirements (THE HOLY TRINITY)

1. **BACKEND TESTS** - Server must respond, serve static files, and handle requests
2. **FRONTEND TESTS** - HTML content, canvas elements, CSS compliance  
3. **DEPLOYMENT TESTS** - GitHub Actions success, build system functionality

### 🎯 What Gets Tested (THE SACRED CHECKLIST)

✅ Server responds with HTTP 200
✅ `full-wasm-skills.js` loads without 404
✅ CSS files served correctly
✅ Technical Expertise section exists
✅ Skills canvas element present
✅ No inline styles (CSP compliant)
✅ Latest GitHub deployment successful
✅ Frontend build system works

### ⚡ Commands You Must Know By Heart

```bash
# Run all tests (THE HOLY COMMAND)
./test_everything.sh

# Build frontend properly
cd frontend && npm run build

# Start server for testing
cargo build --release && ./target/release/personal_website

# Check GitHub deployment status
gh run list --workflow="semantic-release.yml" --limit 1

# Test specific endpoints
curl -I http://localhost:8000/static/js/full-wasm-skills.js
```

### 🚨 FAILURE IS NOT AN OPTION 🚨

If ANY test fails:
1. **STOP EVERYTHING**
2. **FIX THE ISSUE IMMEDIATELY** 
3. **RE-RUN ALL TESTS**
4. **REPEAT UNTIL 100% SUCCESS**

### 🔥 THE GOLDEN RULE 🔥

**"If it's not tested, it's broken. If it's broken, fix it. If it's fixed, test it again."**

---

## 🛠️ Project Structure & Build Commands

### Frontend Build Process
```bash
cd frontend
npm install          # Install dependencies
npm run build        # Build with Vite
./build-frontend.sh   # Full build including WASM file copy
```

### Backend Build Process  
```bash
cargo build --release  # Build Rust server
./target/release/personal_website  # Run server
```

### Static File Management
- Frontend builds to `../static/`
- `full-wasm-skills.js` is copied during build
- CSS is built with hashed filenames
- All files served from `/static/` route

### Deployment Pipeline
- Semantic Release runs on every push to master
- Tests run via GitHub Actions
- Auto-fixes npm dependency issues
- Self-healing CI/CD pipeline

---

## 🙏 Testing Mantras (Repeat Daily)

- "I shall test before I push"
- "I shall verify before I claim"  
- "I shall never break the build"
- "I shall make the CI gods proud"

---

**Remember: These laws are carved in stone. Break them at your own peril.** 🔥⚡🔥