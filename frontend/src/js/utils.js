// Utility functions
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance monitoring
export function initPerformanceMonitoring() {
    // Monitor FPS
    let fps = 0;
    let lastTime = performance.now();
    
    function updateFPS() {
        const now = performance.now();
        fps = 1000 / (now - lastTime);
        lastTime = now;
        
        // Reduce animations if FPS drops below 30
        if (fps < 30) {
            document.body.classList.add('low-performance');
        } else {
            document.body.classList.remove('low-performance');
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
    
    // Monitor memory usage
    if (performance.memory) {
        setInterval(() => {
            const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            if (memoryUsage > 50) { // 50MB threshold
                // High memory usage detected: reduce performance
            }
        }, 10000);
    }
}

// Adaptive performance based on device capabilities
export function adaptPerformance() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isLowEndDevice = navigator.hardwareConcurrency < 4;
    const isSlowConnection = connection && connection.effectiveType === 'slow-2g';
    
    if (isLowEndDevice || isSlowConnection) {
        document.body.classList.add('reduced-animations');
        
        // Add reduced animation styles
        const reducedStyles = document.createElement('style');
        reducedStyles.textContent = `
            .reduced-animations * {
                animation-duration: 0.5s !important;
                transition-duration: 0.2s !important;
            }
            .reduced-animations .cursor-trail,
            .reduced-animations canvas {
                display: none !important;
            }
        `;
        document.head.appendChild(reducedStyles);
    }
}

// Service Worker registration (if available)
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/static/sw.js')
                .then(registration => {
                    // Service worker registered successfully
                })
                .catch(registrationError => {
                    // Service worker registration failed silently
                });
        });
    }
}