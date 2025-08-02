// Full WASM Skills Visualization
// This file only initializes WASM - all rendering is done in Rust

class FullWasmSkills {
    constructor() {
        this.renderer = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
        this.tooltipElement = null;
    }

    async init() {
        try {
            // Load WASM module
            const wasmModule = await import('/static/wasm/wasm_frontend.js');
            await wasmModule.default();
            
            // Create WASM renderer
            this.renderer = new wasmModule.FullWasmRenderer('skills-canvas');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.startAnimation();
            
            this.isInitialized = true;
            
        } catch (error) {
            this.showErrorFallback();
        }
    }

    setupEventListeners() {
        const canvas = document.getElementById('skills-canvas');
        if (!canvas) return;

        // Mouse move for hover effects
        canvas.addEventListener('mousemove', (e) => {
            if (!this.renderer) return;
            
            this.renderer.handle_mouse_move(e.clientX, e.clientY);
            
            // Check for hovered skill and show tooltip
            const hoveredSkill = this.renderer.get_hovered_skill();
            if (hoveredSkill && hoveredSkill.name) {
                this.showTooltip(hoveredSkill, e.clientX, e.clientY);
                canvas.classList.add('cursor-pointer');
            } else {
                this.hideTooltip();
                canvas.classList.remove('cursor-pointer');
            }
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            if (!this.renderer) return;
            this.renderer.handle_mouse_leave();
            this.hideTooltip();
            canvas.classList.remove('cursor-pointer');
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (!this.renderer) return;
            this.renderer.handle_resize();
        });
    }

    startAnimation() {
        const animate = (currentTime) => {
            this.animationId = requestAnimationFrame(animate);
            
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            if (this.renderer && this.isInitialized) {
                try {
                    this.renderer.render(deltaTime);
                } catch (error) {
                    // Silent error handling
                }
            }
        };
        
        animate(0);
    }

    showTooltip(skill, x, y) {
        if (!this.tooltipElement) {
            this.tooltipElement = document.createElement('div');
            this.tooltipElement.id = 'wasm-skills-tooltip';
            this.tooltipElement.className = 'wasm-skills-tooltip';
            document.body.appendChild(this.tooltipElement);
        }
        
        // Set positioning and color using CSS custom properties
        this.tooltipElement.style.setProperty('--tooltip-x', (x + 10) + 'px');
        this.tooltipElement.style.setProperty('--tooltip-y', (y - 60) + 'px');
        this.tooltipElement.style.setProperty('--skill-color', skill.color);
        this.tooltipElement.classList.add('visible');
        
        // Use safe HTML structure with CSS classes
        this.tooltipElement.innerHTML = `
            <strong class="skill-name">${skill.name}</strong>
            <small>${skill.description}</small>
        `;
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.classList.remove('visible');
        }
    }

    showErrorFallback() {
        // Try to load the JavaScript fallback
        if (window.skillsFallback && window.skillsFallback.init) {
            console.log('🔄 WASM failed, falling back to JavaScript visualization');
            window.skillsFallback.init();
        } else {
            // Import fallback if not already loaded
            import('/static/js/skills-fallback.js').then(() => {
                if (window.skillsFallback && window.skillsFallback.init) {
                    window.skillsFallback.init();
                }
            }).catch(() => {
                // Final fallback - show error message
                const skillsContainer = document.querySelector('.skills-container');
                if (skillsContainer) {
                    skillsContainer.innerHTML = `
                        <div class="wasm-skills-error">
                            <h3>🚀 Technical Expertise</h3>
                            <p>Interactive visualization unavailable</p>
                            <p class="error-details">Core skills: Machine Learning, PHP, Laravel, JavaScript, Rust, Vue.js, Python, MySQL, Docker, AWS, Kubernetes, Redis</p>
                        </div>
                    `;
                }
            });
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }

        this.renderer = null;
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) {
        return;
    }
    
    // Initialize Full WASM Skills
    window.fullWasmSkills = new FullWasmSkills();
    await window.fullWasmSkills.init();
});

export { FullWasmSkills };