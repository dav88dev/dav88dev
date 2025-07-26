// Import styles
import '../css/style.css'

// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing website - scroll snap permanently disabled...');
    
    // Initialize GSAP without ScrollTrigger for now
    // gsap.registerPlugin(ScrollTrigger); // Disabled - scroll snap removed
    
    // Initialize components normally
    initNavigation();
    initFormHandling();
    initSkillBars();
    initTiltEffect();
    // initSmoothScroll(); // Disabled - contained scroll snap behavior
    initCursorEffects();
    initParticleSystem();
    initTypingEffect();
    initMagneticButtons();
    initScrollProgress();
    initParallaxEffect();
    
    // Skills visualization will be loaded via separate script tag
    
    // Enhanced page load animations
    const tl = gsap.timeline();
    
    tl.from('.hero-greeting', {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power2.out'
    })
    .from('.hero-name', {
        duration: 1.2,
        scale: 0.8,
        opacity: 0,
        ease: 'elastic.out(1, 0.5)'
    }, '-=0.4')
    .from('.hero-subtitle', {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.6')
    .from('.hero-description', {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.4')
    .from('.hero-buttons .btn', {
        duration: 0.6,
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    }, '-=0.2')
    .from('.hero-scroll', {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.3');
});

// Navigation functionality
function initNavigation() {
    // Desktop navigation scroll effect
    const desktopNavbar = document.querySelector('.desktop-navbar');
    if (desktopNavbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                desktopNavbar.classList.add('scrolled');
            } else {
                desktopNavbar.classList.remove('scrolled');
            }
        });
    }
    
    // COMPLETELY SEPARATE Mobile navigation
    const mobileHamburger = document.getElementById('mobileHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (mobileHamburger && mobileMenu) {
        // Mobile hamburger click
        mobileHamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            mobileHamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when mobile link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileHamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileHamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Active nav link highlighting and footer visibility
    const sections = document.querySelectorAll('section[id]');
    const footer = document.querySelector('.footer');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Show footer only when at contact section
        if (footer) {
            if (current === 'contact') {
                footer.classList.add('visible');
            } else {
                footer.classList.remove('visible');
            }
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    // Fade in animations
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        });
    });
    
    // Timeline items animation - removed x transform to fix alignment
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            ease: 'power2.out',
            delay: index * 0.1
        });
    });
    
    // Project cards animation
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 100,
            opacity: 0,
            ease: 'power2.out',
            delay: index * 0.1
        });
    });
    
    // Skills section now uses Three.js visualization - no GSAP animations needed
    
    // About content animation
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about-content',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        x: -50,
        opacity: 0,
        ease: 'power2.out'
    });
    
    gsap.from('.about-visual', {
        scrollTrigger: {
            trigger: '.about-content',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        x: 50,
        opacity: 0,
        ease: 'power2.out'
    });
    
    // Contact items animation
    gsap.utils.toArray('.contact-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            x: -50,
            opacity: 0,
            ease: 'power2.out',
            delay: index * 0.1
        });
    });
    
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        scale: 0.9,
        opacity: 0,
        ease: 'power2.out'
    });
}

// Form handling
function initFormHandling() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formProps = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = '#10b981';
                
                // Reset form
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 2000);
            }, 1500);
        });
    }
}

// Skill bars animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    skillBars.forEach(bar => {
        gsap.from(bar, {
            scrollTrigger: {
                trigger: bar,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.5,
            width: 0,
            ease: 'power2.out',
            delay: 0.2
        });
    });
}

// Enhanced tilt effect for cards
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('[data-tilt], .project-card');
    const floatingCard = document.querySelector('.floating-card');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            gsap.to(element, {
                duration: 0.3,
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out'
            });
            
            // Add subtle glow effect
            element.style.boxShadow = `
                0 20px 40px rgba(0,0,0,0.1),
                ${rotateY * 2}px ${rotateX * 2}px 20px rgba(99, 102, 241, 0.2)
            `;
        });
        
        element.addEventListener('mouseleave', function() {
            gsap.to(element, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out'
            });
            
            element.style.boxShadow = '';
        });
    });
    
    // Special gentle tilt for floating card
    if (floatingCard) {
        floatingCard.addEventListener('mousemove', function(e) {
            const rect = floatingCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 30; // More subtle rotation
            const rotateY = (centerX - x) / 30; // More subtle rotation
            
            gsap.to(floatingCard, {
                duration: 0.6,
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out',
                force3D: true // Better performance
            });
        });
        
        floatingCard.addEventListener('mouseleave', function() {
            gsap.to(floatingCard, {
                duration: 0.8,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out',
                force3D: true
            });
        });
    }
}

// Enhanced snap scrolling with navigation
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^=\"#\"]');
    const sections = document.querySelectorAll('section[id]');
    
    // Navigate to specific section with snap behavior
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Use scrollIntoView for better snap behavior
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced wheel scrolling for better snap control with Experience section handling
    let isScrolling = false;
    let scrollTimeout;
    
    window.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        
        clearTimeout(scrollTimeout);
        
        const currentSection = getCurrentSection();
        
        // Special handling for Experience section
        if (currentSection && currentSection.id === 'experience') {
            const experienceContainer = currentSection.querySelector('.container');
            if (experienceContainer) {
                const isAtTop = experienceContainer.scrollTop === 0;
                const isAtBottom = experienceContainer.scrollTop + experienceContainer.clientHeight >= experienceContainer.scrollHeight - 10;
                
                // If scrolling down and not at bottom, scroll within experience section
                if (e.deltaY > 0 && !isAtBottom) {
                    return; // Let default scroll behavior handle it
                }
                
                // If scrolling up and not at top, scroll within experience section
                if (e.deltaY < 0 && !isAtTop) {
                    return; // Let default scroll behavior handle it
                }
            }
        }
        
        const direction = e.deltaY > 0 ? 1 : -1; // 1 for down, -1 for up
        const nextSection = getNextSection(currentSection, direction);
        
        if (nextSection) {
            e.preventDefault();
            isScrolling = true;
            
            // Reset Experience section scroll position to top when entering
            if (nextSection.id === 'experience') {
                const experienceContainer = nextSection.querySelector('.container');
                if (experienceContainer) {
                    experienceContainer.scrollTop = 0;
                }
            }
            
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }, { passive: false });
    
    // Get currently visible section
    function getCurrentSection() {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        let currentSection = sections[0];
        
        sections.forEach(section => {
            if (section.offsetTop <= scrollPos) {
                currentSection = section;
            }
        });
        
        return currentSection;
    }
    
    // Get next section based on direction
    function getNextSection(currentSection, direction) {
        const currentIndex = Array.from(sections).indexOf(currentSection);
        const nextIndex = currentIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < sections.length) {
            return sections[nextIndex];
        }
        
        return null;
    }
    
    // Keyboard navigation for sections
    document.addEventListener('keydown', function(e) {
        if (isScrolling) return;
        
        let direction = 0;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                direction = 1;
                break;
            case 'ArrowUp':
            case 'PageUp':
                direction = -1;
                break;
            case 'Home':
                sections[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            case 'End':
                sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            default:
                return;
        }
        
        if (direction !== 0) {
            e.preventDefault();
            const currentSection = getCurrentSection();
            const nextSection = getNextSection(currentSection, direction);
            
            if (nextSection) {
                isScrolling = true;
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        }
    });
}

// Utility functions
function debounce(func, wait) {
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

function throttle(func, limit) {
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

// Enhanced Intersection Observer for performance
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: [0.1, 0.5, 0.9]
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Three.js skills visualization handles its own animations
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const observeElements = document.querySelectorAll('.timeline-item, .project-card, .contact-item');
    observeElements.forEach(el => observer.observe(el));
    
    // Add hover sound effects (optional)
    const hoverElements = document.querySelectorAll('.btn, .nav-link, .project-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            // Subtle scale animation on hover
            gsap.to(el, {
                duration: 0.3,
                scale: 1.05,
                ease: 'power2.out'
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });
        });
    });
});

// Enhanced cursor effects
function initCursorEffects() {
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

// Particle system
function initParticleSystem() {
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

// Typing effect
function initTypingEffect() {
    const titles = [
        'Senior Software Engineer',
        'Site Reliability Engineer',
        'Full Stack Developer',
        'DevOps Specialist',
        'AI/ML Enthusiast'
    ];
    
    const subtitleElement = document.querySelector('.hero-subtitle');
    if (!subtitleElement) return;
    
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    
    function type() {
        const fullText = titles[currentIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
        }
        
        subtitleElement.textContent = currentText || ' ';
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && currentText === fullText) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % titles.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing effect after initial animation
    setTimeout(type, 3000);
}

// Magnetic buttons
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// Scroll progress indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    }
    
    window.addEventListener('scroll', throttle(updateProgress, 10));
}

// Parallax effect
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero');
    
    function updateParallax() {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    window.addEventListener('scroll', throttle(updateParallax, 16));
}

// Enhanced preloader functionality
window.addEventListener('load', () => {
    // Scroll position management removed - allow natural scrolling
    
    const loader = document.getElementById('loader');
    if (loader) {
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
                    document.body.classList.add('page-transition');
                }
            });
        }, 2000);
    }
});

// Enhanced performance optimization
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--animation-duration', '0s');
    gsap.globalTimeline.timeScale(0);
}

// Adaptive performance based on device capabilities
function adaptPerformance() {
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

// Initialize adaptive performance
document.addEventListener('DOMContentLoaded', adaptPerformance);

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// Advanced performance monitoring
function initPerformanceMonitoring() {
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
                console.warn('High memory usage detected:', memoryUsage.toFixed(2) + 'MB');
            }
        }, 10000);
    }
}

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);

// Easter egg - Konami code
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