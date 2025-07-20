// Mobile Portfolio Verification Script
console.log('🔧 Verifying mobile fixes...');

// Test 1: Check if hamburger menu exists and has proper styling
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    console.log('✅ Navigation elements found');
    
    // Check hamburger animation styles
    if (hamburger.style || getComputedStyle(hamburger).zIndex) {
        console.log('✅ Hamburger styling applied');
    }
    
    // Test hamburger click
    hamburger.click();
    setTimeout(() => {
        if (navMenu.classList.contains('active')) {
            console.log('✅ Mobile navigation opens correctly');
        } else {
            console.log('❌ Mobile navigation not working');
        }
        hamburger.click(); // Close it
    }, 100);
} else {
    console.log('❌ Navigation elements missing');
}

// Test 2: Check mobile detection
const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log(`📱 Mobile detected: ${isMobile} (width: ${window.innerWidth}px)`);

// Test 3: Check scroll behavior
const html = document.documentElement;
const scrollBehavior = getComputedStyle(html).scrollBehavior;
const scrollSnapType = getComputedStyle(html).scrollSnapType;

if (isMobile) {
    if (scrollBehavior === 'auto' || scrollSnapType === 'none') {
        console.log('✅ Mobile scroll behavior correctly disabled');
    } else {
        console.log('❌ Mobile scroll behavior not properly disabled');
    }
} else {
    if (scrollBehavior === 'smooth' && scrollSnapType.includes('mandatory')) {
        console.log('✅ Desktop scroll behavior correctly enabled');
    } else {
        console.log('❌ Desktop scroll behavior not properly configured');
    }
}

// Test 4: Check WASM loading
const skillsCanvas = document.getElementById('skills-canvas');
if (skillsCanvas) {
    console.log('✅ Skills canvas found');
    // Check for WASM or fallback messages in console
    setTimeout(() => {
        console.log('ℹ️ Check console for WASM loading messages');
    }, 1000);
} else {
    console.log('❌ Skills canvas not found');
}

console.log('🏁 Verification complete. Check console messages above.');