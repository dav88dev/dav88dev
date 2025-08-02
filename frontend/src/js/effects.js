// Heavy effects - lazy loaded when needed
import { throttle } from './utils.js';

// Enhanced cursor effects
export function initCursorEffects() {
    // Only initialize on devices with mouse
    if (window.matchMedia("(pointer: coarse)").matches) {
        return; // Skip on touch devices
    }
    
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();
    
    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursor.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)';
        });
    });
}

// Particle system - lazy loaded
export function initParticleSystem() {
    // Skip on low-end devices
    if (navigator.hardwareConcurrency < 4) {
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-2';
    canvas.style.opacity = '0.1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Enhanced preloader functionality
export function initPreloader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    // Animate loader bar
    const loaderBar = loader.querySelector('.loader-bar');
    if (loaderBar) {
        gsap.to(loaderBar, {
            duration: 1.5,
            width: '100%',
            ease: 'power2.out'
        });
    }
    
    setTimeout(() => {
        gsap.to(loader, {
            duration: 0.8,
            opacity: 0,
            scale: 1.1,
            ease: 'power2.inOut',
            onComplete: () => {
                loader.style.display = 'none';
                // REMOVED: document.body.classList.add('page-transition');
                // This was causing navigation to disappear
            }
        });
    }, 2000);
}

// Easter egg - Konami code
export function initKonamiCode() {
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            // Activate party mode
            document.body.classList.add('party-mode');
            
            // Add party styles
            const partyStyles = document.createElement('style');
            partyStyles.textContent = `
                .party-mode * {
                    animation: rainbow 1s infinite linear !important;
                }
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(partyStyles);
            
            setTimeout(() => {
                document.body.classList.remove('party-mode');
                partyStyles.remove();
            }, 10000);
        }
    });
}