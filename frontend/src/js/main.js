// Import styles
import '../css/style.css'

// Import core modules synchronously for critical functionality
import { initNavigation } from './navigation.js';
import { adaptPerformance, registerServiceWorker } from './utils.js';

// Main JavaScript functionality - optimized for performance
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize critical functionality immediately
    initNavigation();
    adaptPerformance();
    
    // Register service worker for PWA
    registerServiceWorker();
    
    // Basic hero animation (critical path)
    if (window.gsap) {
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
    }
    
    // Lazy load animations module when user scrolls or after delay
    let animationsLoaded = false;
    const loadAnimations = async () => {
        if (animationsLoaded) return;
        animationsLoaded = true;
        
        try {
            const { 
                initScrollAnimations, 
                initSkillBars, 
                initTiltEffect, 
                initTypingEffect, 
                initMagneticButtons, 
                initScrollProgress, 
                initParallaxEffect 
            } = await import('./animations.js');
            
            // Initialize animation features
            initSkillBars();
            initTiltEffect();
            initTypingEffect();
            initMagneticButtons();
            initScrollProgress();
            initParallaxEffect();
            initScrollAnimations();
        } catch (error) {
            // Graceful fallback if animations fail to load
        }
    };
    
    // Lazy load effects when user interacts or after delay
    let effectsLoaded = false;
    const loadEffects = async () => {
        if (effectsLoaded) return;
        effectsLoaded = true;
        
        try {
            const { 
                initCursorEffects, 
                initParticleSystem, 
                initPreloader, 
                initKonamiCode 
            } = await import('./effects.js');
            
            // Initialize effect features (only if performance allows)
            if (!document.body.classList.contains('reduced-animations')) {
                initCursorEffects();
                initParticleSystem();
            }
            initPreloader();
            initKonamiCode();
        } catch (error) {
            // Graceful fallback if effects fail to load
        }
    };
    
    // Load animations after initial render or on scroll
    const loadAnimationsOnInteraction = () => {
        loadAnimations();
        // Remove event listeners after first load
        window.removeEventListener('scroll', loadAnimationsOnInteraction);
        window.removeEventListener('touchstart', loadAnimationsOnInteraction);
        window.removeEventListener('mousemove', loadAnimationsOnInteraction);
    };
    
    // Schedule lazy loading
    setTimeout(loadAnimations, 1000); // Load after 1 second
    setTimeout(loadEffects, 2000); // Load effects after 2 seconds
    
    // Also load on user interaction
    window.addEventListener('scroll', loadAnimationsOnInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', loadAnimationsOnInteraction, { passive: true, once: true });
    window.addEventListener('mousemove', loadAnimationsOnInteraction, { passive: true, once: true });
});