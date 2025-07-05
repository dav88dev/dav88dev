// Simple WASM Skills Visualization - 100% Reliable, No Three.js
import init, { SimpleSkillsRenderer } from '../wasm/wasm_frontend.js';

class SimpleWASMSkills {
    constructor() {
        this.renderer = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
        
        // Skills data matching CV data
        this.skillsData = [
            { name: 'PHP', level: 95, category: 'Backend', color: '#6366f1' },
            { name: 'JavaScript', level: 92, category: 'Frontend', color: '#8b5cf6' },
            { name: 'Python', level: 88, category: 'Backend', color: '#6366f1' },
            { name: 'TypeScript', level: 85, category: 'Frontend', color: '#8b5cf6' },
            { name: 'React', level: 90, category: 'Frontend', color: '#8b5cf6' },
            { name: 'Node.js', level: 87, category: 'Backend', color: '#6366f1' },
            { name: 'MySQL', level: 90, category: 'Database', color: '#06b6d4' },
            { name: 'PostgreSQL', level: 85, category: 'Database', color: '#06b6d4' },
            { name: 'Docker', level: 83, category: 'DevOps', color: '#10b981' },
            { name: 'AWS', level: 80, category: 'DevOps', color: '#10b981' },
            { name: 'Rust', level: 82, category: 'Backend', color: '#6366f1' },
            { name: 'Machine Learning', level: 75, category: 'AI/ML', color: '#f59e0b' }
        ];
    }

    async init() {
        console.log('🦀 Initializing Simple WASM Skills...');
        
        try {
            // Initialize WASM module
            await init();
            
            // Create renderer
            this.renderer = new SimpleSkillsRenderer();
            
            // Initialize with canvas and skills data
            await this.renderer.init('skills-canvas', JSON.stringify(this.skillsData));
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.startAnimationLoop();
            
            this.isInitialized = true;
            console.log('✅ Simple WASM Skills initialized successfully!');
            
            // Update UI controls
            this.updateControlButtons();
            
        } catch (error) {
            console.error('❌ Failed to initialize Simple WASM Skills:', error);
            this.showError(error.message);
        }
    }

    setupEventListeners() {
        // Animation mode controls
        const controlButtons = document.querySelectorAll('.skills-control-btn');
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                controlButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const mode = button.dataset.mode;
                this.setAnimationMode(mode);
            });
        });

        // Canvas mouse interactions
        const canvas = document.getElementById('skills-canvas');
        if (canvas) {
            canvas.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });

            canvas.addEventListener('mouseleave', () => {
                this.hideSkillInfo();
            });

            canvas.addEventListener('click', (event) => {
                this.handleClick(event);
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    updateControlButtons() {
        // Replace old controls with new animation modes
        const controlsContainer = document.querySelector('.skills-controls');
        if (controlsContainer) {
            controlsContainer.innerHTML = `
                <button class="skills-control-btn active" data-mode="orbit">🌍 Orbit</button>
                <button class="skills-control-btn" data-mode="grid">📱 Grid</button>
                <button class="skills-control-btn" data-mode="wave">🌊 Wave</button>
                <button class="skills-control-btn" data-mode="spiral">🌀 Spiral</button>
            `;
            
            // Re-attach event listeners
            this.setupEventListeners();
        }
    }

    setAnimationMode(mode) {
        if (this.renderer && this.isInitialized) {
            this.renderer.set_animation_mode(mode);
            console.log(`🎮 Animation mode changed to: ${mode}`);
        }
    }

    handleMouseMove(event) {
        if (!this.renderer || !this.isInitialized) return;

        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const skillName = this.renderer.get_skill_at_position(x, y);
        if (skillName) {
            const skillInfo = this.renderer.get_skill_info(skillName);
            if (skillInfo) {
                this.showSkillInfo(skillInfo);
                canvas.style.cursor = 'pointer';
            }
        } else {
            this.hideSkillInfo();
            canvas.style.cursor = 'default';
        }
    }

    handleClick(event) {
        if (!this.renderer || !this.isInitialized) return;

        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const skillName = this.renderer.get_skill_at_position(x, y);
        if (skillName) {
            console.log(`🎯 Clicked on skill: ${skillName}`);
            
            // Show detailed skill info
            const skillInfo = this.renderer.get_skill_info(skillName);
            this.showDetailedSkillInfo(skillInfo);
        }
    }

    showSkillInfo(skillInfo) {
        const infoPanel = document.getElementById('skill-info');
        const skillName = document.getElementById('skill-name');
        const skillDescription = document.getElementById('skill-description');

        if (infoPanel && skillName && skillDescription) {
            skillName.textContent = skillInfo.name;
            skillDescription.innerHTML = `
                <strong>Proficiency:</strong> ${skillInfo.level}%<br>
                <strong>Category:</strong> ${skillInfo.category}<br>
                <strong>Rendering:</strong> Pure Rust WASM
            `;

            infoPanel.style.opacity = '1';
            infoPanel.style.transform = 'translateY(0)';
        }
    }

    showDetailedSkillInfo(skillInfo) {
        // Create a more detailed popup or modal
        const detailsHtml = `
            <div class="skill-details-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 10, 30, 0.95);
                color: white;
                padding: 20px;
                border-radius: 10px;
                border: 2px solid ${skillInfo.color};
                z-index: 1000;
                max-width: 300px;
            ">
                <h3 style="color: ${skillInfo.color}; margin-top: 0;">${skillInfo.name}</h3>
                <p><strong>Proficiency:</strong> ${skillInfo.level}%</p>
                <p><strong>Category:</strong> ${skillInfo.category}</p>
                <p><strong>Experience:</strong> Professional level</p>
                <p><strong>Renderer:</strong> Pure Rust WebAssembly</p>
                <button onclick="this.parentElement.remove()" style="
                    background: ${skillInfo.color};
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Close</button>
            </div>
        `;

        // Remove any existing popup
        const existingPopup = document.querySelector('.skill-details-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Add new popup
        document.body.insertAdjacentHTML('beforeend', detailsHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const popup = document.querySelector('.skill-details-popup');
            if (popup) popup.remove();
        }, 5000);
    }

    hideSkillInfo() {
        const infoPanel = document.getElementById('skill-info');
        if (infoPanel) {
            infoPanel.style.opacity = '0';
            infoPanel.style.transform = 'translateY(20px)';
        }
    }

    handleResize() {
        if (this.renderer && this.isInitialized) {
            const canvas = document.getElementById('skills-canvas');
            if (canvas) {
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                this.renderer.resize(width, height);
            }
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

    showError(message) {
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer) {
            skillsContainer.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px;
                    color: #ff6b6b;
                    background: rgba(255, 107, 107, 0.1);
                    border-radius: 10px;
                    border: 1px solid #ff6b6b;
                ">
                    <h3>⚠️ WASM Skills Renderer Error</h3>
                    <p>${message}</p>
                    <p>Please check the browser console for more details.</p>
                    <button onclick="location.reload()" style="
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Page</button>
                </div>
            `;
        }
    }

    // Performance monitoring
    getPerformanceStats() {
        return {
            renderer: 'Simple WASM Renderer',
            isInitialized: this.isInitialized,
            skillsCount: this.skillsData.length,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : 'Not available',
            wasmReady: this.renderer?.is_ready() || false
        };
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        this.renderer = null;
        this.isInitialized = false;

        console.log('🗑️ Simple WASM Skills destroyed');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check if skills canvas exists
    const skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) {
        console.log('Skills canvas not found, skipping Simple WASM Skills');
        return;
    }

    console.log('🚀 Starting Simple WASM Skills...');
    
    // Initialize Simple WASM Skills
    window.simpleWasmSkills = new SimpleWASMSkills();
    await window.simpleWasmSkills.init();
    
    // Make performance stats available globally
    window.getWASMSkillsStats = () => window.simpleWasmSkills.getPerformanceStats();
});

export { SimpleWASMSkills };