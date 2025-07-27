// Navigation functionality
export function initNavigation() {
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
            
            const isActive = mobileHamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            mobileHamburger.setAttribute('aria-expanded', isActive);
            
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
                mobileHamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                mobileHamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileHamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Active nav link highlighting and footer visibility
    const sections = document.querySelectorAll('section[id]');
    const footer = document.querySelector('.footer');
    const navLinks = document.querySelectorAll('.desktop-nav-link, .mobile-link');
    
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