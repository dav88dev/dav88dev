// Animation-related functionality - lazy loaded
import { throttle } from './utils.js';

export function initScrollAnimations() {
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
    
    // Contact form animation - commented out since form is commented out in HTML
    /*
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
    */
}

// Skill bars animation
export function initSkillBars() {
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
export function initTiltEffect() {
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
            // Use CSS class instead of inline styles
            element.classList.add('tilt-shadow');
        });
        
        element.addEventListener('mouseleave', function() {
            gsap.to(element, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out'
            });
            
            element.classList.remove('tilt-shadow');
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

// Typing effect
export function initTypingEffect() {
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
            typeSpeed = 1500; // Reduced from 2000ms to improve performance
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % titles.length;
            typeSpeed = 300; // Reduced from 500ms to improve performance
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing effect after initial animation (reduced delay)
    setTimeout(type, 2000);
}

// Magnetic buttons
export function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Use GSAP instead of inline styles
            gsap.set(button, { x: x * 0.1, y: y * 0.1 });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.set(button, { x: 0, y: 0 });
        });
    });
}

// Scroll progress indicator
export function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
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
export function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero');
    
    function updateParallax() {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = -(scrollTop * speed);
            gsap.set(element, { y: yPos });
        });
    }
    
    window.addEventListener('scroll', throttle(updateParallax, 16));
}