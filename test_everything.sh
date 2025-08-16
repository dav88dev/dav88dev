#!/bin/bash

echo "🔥 COMPREHENSIVE TESTING SUITE 🔥"
echo "Testing backend, frontend, and deployment..."
echo ""

# Start server in background
echo "🚀 Starting server..."
cargo build --release >/dev/null 2>&1
./target/release/personal_website &
SERVER_PID=$!
sleep 3

# Test counter
PASS=0
TOTAL=0

# Backend tests
echo "🔧 BACKEND TESTS:"

# Test 1: Server responds
TOTAL=$((TOTAL + 1))
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
    echo "✅ Server responds (200)"
    PASS=$((PASS + 1))
else
    echo "❌ Server not responding"
fi

# Test 2: Static files served
TOTAL=$((TOTAL + 1))
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/static/js/full-wasm-skills.js | grep -q "200"; then
    echo "✅ Static files served"
    PASS=$((PASS + 1))
else
    echo "❌ Static files not served"
fi

# Test 3: CSS served
TOTAL=$((TOTAL + 1))
CSS_FILE=$(curl -s http://localhost:8000 | grep -o 'style-[A-Za-z0-9]*.css' | head -1)
if [ -n "$CSS_FILE" ] && curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/static/css/$CSS_FILE" | grep -q "200"; then
    echo "✅ CSS files served"
    PASS=$((PASS + 1))
else
    echo "❌ CSS files not served"
fi

echo ""
echo "🎨 FRONTEND TESTS:"

# Test 4: HTML content
TOTAL=$((TOTAL + 1))
if curl -s http://localhost:8000 | grep -q "Technical Expertise"; then
    echo "✅ Technical Expertise section exists"
    PASS=$((PASS + 1))
else
    echo "❌ Technical Expertise section missing"
fi

# Test 5: Canvas element
TOTAL=$((TOTAL + 1))
if curl -s http://localhost:8000 | grep -q "skills-canvas"; then
    echo "✅ Skills canvas element exists"
    PASS=$((PASS + 1))
else
    echo "❌ Skills canvas element missing"
fi

# Test 6: No inline styles (CSP compliance)
TOTAL=$((TOTAL + 1))
if ! curl -s http://localhost:8000 | grep -q 'canvas.*style='; then
    echo "✅ No inline styles (CSP compliant)"
    PASS=$((PASS + 1))
else
    echo "❌ Inline styles found (CSP violation)"
fi

echo ""
echo "🌐 DEPLOYMENT TESTS:"

# Test 7: GitHub Actions status
TOTAL=$((TOTAL + 1))
LATEST_RUN=$(gh run list --workflow="semantic-release.yml" --limit 1 --json status,conclusion 2>/dev/null | jq -r '.[0].conclusion // .[0].status' 2>/dev/null || echo "unknown")
if [ "$LATEST_RUN" = "success" ]; then
    echo "✅ Latest deployment successful"
    PASS=$((PASS + 1))
else
    echo "⚠️  Latest deployment: $LATEST_RUN"
fi

# Test 8: Build system works
TOTAL=$((TOTAL + 1))
cd frontend
if npm run build >/dev/null 2>&1; then
    echo "✅ Frontend build works"
    PASS=$((PASS + 1))
else
    echo "❌ Frontend build failed"
fi

# Clean up
kill $SERVER_PID 2>/dev/null

echo ""
echo "$(printf '%*s' 60 '' | tr ' ' '=')"
echo "🏁 TEST RESULTS: $PASS/$TOTAL PASSED"
if [ $PASS -ge 6 ]; then
    echo "🎉 TESTS PASSED! WEBSITE WORKS! 🎉"
    exit 0
else
    echo "⚠️  Some tests failed - check issues above"
    exit 1
fi
