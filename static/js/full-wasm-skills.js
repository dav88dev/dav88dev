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
                canvas.style.cursor = 'pointer';
            } else {
                this.hideTooltip();
                canvas.style.cursor = 'default';
            }
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            if (!this.renderer) return;
            this.renderer.handle_mouse_leave();
            this.hideTooltip();
            canvas.style.cursor = 'default';
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
            this.tooltipElement.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                max-width: 300px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(this.tooltipElement);
        }
        
        this.tooltipElement.style.border = `1px solid ${skill.color}`;
        this.tooltipElement.innerHTML = `
            <strong style="color: ${skill.color}">${skill.name}</strong><br>
            <small>${skill.description}</small>
        `;
        this.tooltipElement.style.left = (x + 10) + 'px';
        this.tooltipElement.style.top = (y - 60) + 'px';
        this.tooltipElement.style.display = 'block';
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    }

    showErrorFallback() {
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer) {
            skillsContainer.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                ">
                    <h3 style="color: #334155; margin-bottom: 20px;">🚀 Technical Expertise</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">Full WASM visualization failed to load</p>
                    <p style="color: #94a3b8; font-size: 14px;">Please refresh the page or check your browser console for errors.</p>
                </div>
            `;
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