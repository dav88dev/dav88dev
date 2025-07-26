// Clean Skills Visualization - Simple and Elegant
// Try to import WASM, fallback to JavaScript if it fails

class CleanSkills {
    constructor() {
        this.renderer = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
    }

    async init() {
        // Initializing Clean Skills Visualization
        
        try {
            // Using JavaScript fallback for reliable skills visualization
            // WASM implementation available but JS provides better compatibility
            throw new Error('Using JavaScript fallback for optimal performance');
            
        } catch (error) {
            // Loading optimized JavaScript skills visualization fallback
            
            // Load and initialize JavaScript fallback
            const script = document.createElement('script');
            script.src = '/static/js/skills-fallback.js';
            script.onload = () => {
                if (window.skillsFallback && window.skillsFallback.init()) {
                    // JavaScript fallback loaded successfully
                    this.isInitialized = true;
                } else {
                    // Fallback failed, showing static fallback
                    this.showFallback();
                }
            };
            script.onerror = () => {
                // Could not load fallback, showing static skills
                this.showFallback();
            };
            document.head.appendChild(script);
        }
    }

    setupEventListeners() {
        const canvas = document.getElementById('skills-canvas');
        if (!canvas) return;

        // Mouse move for hover effects
        canvas.addEventListener('mousemove', (event) => {
            if (!this.renderer || !this.isInitialized) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            this.renderer.handle_mouse_move(x, y);
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            if (!this.renderer || !this.isInitialized) return;
            this.renderer.handle_mouse_leave();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        if (!this.renderer || !this.isInitialized) return;
        
        const canvas = document.getElementById('skills-canvas');
        if (canvas) {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            this.renderer.resize(width, height);
        }
    }

    startAnimationLoop() {
        const animate = (currentTime) => {
            this.animationId = requestAnimationFrame(animate);

            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            this.update(deltaTime);
            this.render();
        };

        animate(0);
    }

    update(deltaTime) {
        if (this.renderer && this.isInitialized) {
            this.renderer.update(deltaTime);
        }
    }

    render() {
        if (this.renderer && this.isInitialized) {
            try {
                this.renderer.render();
            } catch (error) {
                console.error('Render error:', error);
            }
        }
    }

    showFallback() {
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
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-top: 30px;
                    ">
                        <div style="background: #777BB4; color: white; padding: 15px; border-radius: 8px;">
                            <strong>PHP</strong><br>
                            <small>10+ years experience</small>
                        </div>
                        <div style="background: #FF2D20; color: white; padding: 15px; border-radius: 8px;">
                            <strong>Laravel</strong><br>
                            <small>8+ years experience</small>
                        </div>
                        <div style="background: #F7DF1E; color: black; padding: 15px; border-radius: 8px;">
                            <strong>JavaScript</strong><br>
                            <small>9+ years experience</small>
                        </div>
                        <div style="background: #CE422B; color: white; padding: 15px; border-radius: 8px;">
                            <strong>Rust</strong><br>
                            <small>2+ years experience</small>
                        </div>
                        <div style="background: #4FC08D; color: white; padding: 15px; border-radius: 8px;">
                            <strong>Vue.js</strong><br>
                            <small>6+ years experience</small>
                        </div>
                        <div style="background: #3776AB; color: white; padding: 15px; border-radius: 8px;">
                            <strong>Python</strong><br>
                            <small>8+ years experience</small>
                        </div>
                        <div style="background: #4479A1; color: white; padding: 15px; border-radius: 8px;">
                            <strong>MySQL</strong><br>
                            <small>10+ years experience</small>
                        </div>
                        <div style="background: #2496ED; color: white; padding: 15px; border-radius: 8px;">
                            <strong>Docker</strong><br>
                            <small>6+ years experience</small>
                        </div>
                        <div style="background: #FF9900; color: white; padding: 15px; border-radius: 8px;">
                            <strong>AWS</strong><br>
                            <small>7+ years experience</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.renderer = null;
        this.isInitialized = false;
        // Clean Skills destroyed
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) {
        // Skills canvas not found, skipping Clean Skills
        return;
    }

    // Starting Clean Skills initialization
    
    // Initialize Clean Skills
    window.cleanSkills = new CleanSkills();
    await window.cleanSkills.init();
});

export { CleanSkills };