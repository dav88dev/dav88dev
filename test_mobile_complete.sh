#!/bin/bash

echo "🚀 AUTOMATED MOBILE TEST SUITE FOR PORTFOLIO"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Test 1: Check if server is running
echo -e "\n${BLUE}TEST 1: Server Status${NC}"
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000)
if [ "$SERVER_STATUS" = "200" ]; then
    print_result 0 "Server is running on port 8000"
else
    print_result 1 "Server not responding (HTTP $SERVER_STATUS)"
    echo "Starting server..."
    cd /home/dav88dev/DAV88DEV/myRustWebsite
    cargo run --release &
    sleep 5
fi

# Test 2: Check CSS file generation
echo -e "\n${BLUE}TEST 2: CSS Generation${NC}"
LATEST_CSS=$(ls -t static/css/style-*.css 2>/dev/null | head -1)
if [ -n "$LATEST_CSS" ]; then
    print_result 0 "Latest CSS found: $LATEST_CSS"
    
    # Check if hamburger styles exist
    if grep -q "hamburger.*display.*flex" "$LATEST_CSS"; then
        print_result 0 "Hamburger mobile styles present"
    else
        print_result 1 "Hamburger mobile styles missing"
    fi
    
    # Check if mobile nav-menu styles exist
    if grep -q "nav-menu.*position.*fixed" "$LATEST_CSS"; then
        print_result 0 "Mobile navigation styles present"
    else
        print_result 1 "Mobile navigation styles missing"
    fi
else
    print_result 1 "No CSS files found in static/css/"
fi

# Test 3: Check HTML structure
echo -e "\n${BLUE}TEST 3: HTML Structure${NC}"
HTML_CONTENT=$(curl -s http://localhost:8000)

# Check hamburger menu
if echo "$HTML_CONTENT" | grep -q '<div class="hamburger">'; then
    print_result 0 "Hamburger menu HTML structure present"
else
    print_result 1 "Hamburger menu HTML structure missing"
fi

# Check nav-menu structure
if echo "$HTML_CONTENT" | grep -q '<ul class="nav-menu">'; then
    print_result 0 "Navigation menu HTML structure present"
else
    print_result 1 "Navigation menu HTML structure missing"
fi

# Test 4: JavaScript mobile detection
echo -e "\n${BLUE}TEST 4: JavaScript Files${NC}"
LATEST_JS=$(echo "$HTML_CONTENT" | grep -o 'main-[^"]*\.js' | head -1)
if [ -n "$LATEST_JS" ]; then
    print_result 0 "Main JS file: $LATEST_JS"
    
    # Check if mobile detection code exists
    if [ -f "static/js/$LATEST_JS" ] && grep -q "isMobile.*innerWidth.*768" "static/js/$LATEST_JS"; then
        print_result 0 "Mobile detection code present"
    else
        print_result 1 "Mobile detection code missing or incorrect"
    fi
else
    print_result 1 "Main JS file not found"
fi

# Test 5: WASM Error Check
echo -e "\n${BLUE}TEST 5: WASM Configuration${NC}"
if grep -q "Using JavaScript fallback - WASM contains outdated" static/js/clean-skills.js; then
    print_result 1 "WASM still has forced error message"
else
    print_result 0 "WASM error message removed"
fi

# Test 6: Create mobile simulation test
echo -e "\n${BLUE}TEST 6: Creating Mobile Simulation${NC}"

cat > mobile_simulation_test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile Test</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .test { margin: 10px 0; padding: 15px; border-radius: 8px; }
        .pass { background: #d4edda; border: 1px solid #c3e6cb; }
        .fail { background: #f8d7da; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; }
        iframe { width: 100%; height: 500px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>📱 Portfolio Mobile Test</h1>
    
    <div class="test info">
        <h3>Device Info</h3>
        <p>Width: <span id="width"></span>px</p>
        <p>Mobile Detected: <span id="mobile"></span></p>
        <p>User Agent: <span id="ua"></span></p>
    </div>
    
    <div class="test">
        <h3>Portfolio Preview</h3>
        <iframe src="http://localhost:8000" onload="testIframe()"></iframe>
    </div>
    
    <div id="results"></div>
    
    <script>
        document.getElementById('width').textContent = window.innerWidth;
        const isMobile = window.innerWidth <= 768 || /Mobile|Android|iPhone/i.test(navigator.userAgent);
        document.getElementById('mobile').textContent = isMobile ? 'YES' : 'NO';
        document.getElementById('ua').textContent = navigator.userAgent.substring(0, 60) + '...';
        
        function testIframe() {
            const results = document.getElementById('results');
            results.innerHTML = `
                <div class="test ${isMobile ? 'pass' : 'info'}">
                    <h3>Test Results</h3>
                    <p>✅ Portfolio loaded successfully</p>
                    <p>✅ Mobile detection: ${isMobile ? 'MOBILE' : 'DESKTOP'}</p>
                    <p>ℹ️ If mobile: Check if hamburger menu (☰) is visible in top-right</p>
                    <p>ℹ️ If mobile: Click hamburger to test navigation</p>
                    <p>ℹ️ Scroll should be normal on mobile (no snap behavior)</p>
                </div>
            `;
        }
    </script>
</body>
</html>
EOF

print_result 0 "Mobile simulation test created: mobile_simulation_test.html"

# Test 7: Open browser for manual verification
echo -e "\n${BLUE}TEST 7: Opening Browser Tests${NC}"

if command -v chromium-browser &> /dev/null; then
    print_info "Opening Chromium with mobile simulation..."
    
    # Open main portfolio
    chromium-browser --new-window \
        --window-size=375,667 \
        --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15" \
        http://localhost:8000 &
    
    sleep 2
    
    # Open test page
    chromium-browser --new-window \
        file://$(pwd)/mobile_simulation_test.html &
    
    print_result 0 "Browser windows opened for manual testing"
else
    print_warning "Chromium not available, skipping browser test"
fi

echo -e "\n${GREEN}🎉 AUTOMATED TESTS COMPLETE${NC}"
echo -e "\n${YELLOW}MANUAL VERIFICATION STEPS:${NC}"
echo "1. Check the opened browser windows"
echo "2. In mobile view, look for hamburger menu (☰) in top-right"
echo "3. Click hamburger menu - it should slide in from right"
echo "4. Check that 'Hello, I'm' text is not hidden under navbar"
echo "5. Test scrolling - should be normal mobile scroll (no snapping)"
echo "6. Check console for any WASM error messages"

echo -e "\n${BLUE}To test manually:${NC}"
echo "- Press F12 in browser"
echo "- Click device toolbar icon (📱)"
echo "- Select iPhone or mobile device"
echo "- Test the hamburger menu"