// Pure Rust Frontend Controller
// This demonstrates a complete Rust-based frontend replacing JavaScript

import init, { WasmApp, PureRustRenderer } from '../wasm/wasm_frontend.js';

class RustFrontendController {
    constructor() {
        this.wasmApp = null;
        this.pureRenderer = null;
        this.isInitialized = false;
        this.renderMode = 'hybrid'; // 'hybrid' or 'pure-rust'
        this.animationId = null;
        this.lastTime = 0;
        
        // Skills data
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

    async init(renderMode = 'hybrid') {
        console.log(`Initializing Rust Frontend Controller in ${renderMode} mode...`);
        
        try {
            await init();
            this.renderMode = renderMode;
            
            if (renderMode === 'pure-rust') {
                await this.initPureRustMode();
            } else {
                await this.initHybridMode();
            }
            
            this.setupEventListeners();
            this.startAnimationLoop();
            
            this.isInitialized = true;
            console.log('Rust Frontend Controller initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize Rust Frontend:', error);
            this.fallbackToJavaScript();
        }
    }

    async initPureRustMode() {
        console.log('Initializing Pure Rust Mode...');
        
        this.pureRenderer = new PureRustRenderer();
        await this.pureRenderer.init('skills-canvas', JSON.stringify(this.skillsData));
        
        // Hide Three.js dependent UI elements
        this.hideThreeJSElements();
        
        console.log('Pure Rust Mode initialized');
    }

    async initHybridMode() {
        console.log('Initializing Hybrid Mode (WASM + Three.js)...');
        
        this.wasmApp = new WasmApp();
        await this.wasmApp.init(JSON.stringify(this.skillsData));
        
        console.log('Hybrid Mode initialized');
    }

    hideThreeJSElements() {
        // Hide elements that depend on Three.js
        const threeJSElements = document.querySelectorAll('.three-js-dependent');
        threeJSElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Show pure Rust UI elements
        const rustElements = document.querySelectorAll('.rust-only');
        rustElements.forEach(el => {
            el.style.display = 'block';
        });
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

        // Mouse interactions for Pure Rust mode
        if (this.renderMode === 'pure-rust') {
            const canvas = document.getElementById('skills-canvas');
            if (canvas) {
                canvas.addEventListener('mousemove', (event) => {
                    this.handleMouseMove(event);
                });
                
                canvas.addEventListener('click', (event) => {
                    this.handleMouseClick(event);
                });
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setAnimationMode(mode) {
        if (this.renderMode === 'pure-rust' && this.pureRenderer) {
            this.pureRenderer.set_animation_mode(mode);
        } else if (this.renderMode === 'hybrid' && this.wasmApp) {
            this.wasmApp.set_skills_animation_mode(mode);
        }
        
        console.log(`Animation mode changed to: ${mode}`);
    }

    handleMouseMove(event) {
        if (this.renderMode === 'pure-rust' && this.pureRenderer) {
            const canvas = event.target;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const skillName = this.pureRenderer.get_skill_at_position(x, y);
            if (skillName) {
                this.showSkillInfo(skillName);
            } else {
                this.hideSkillInfo();
            }
        }
    }

    handleMouseClick(event) {
        if (this.renderMode === 'pure-rust') {
            const canvas = event.target;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const skillName = this.pureRenderer?.get_skill_at_position(x, y);
            if (skillName) {
                console.log(`Clicked on skill: ${skillName}`);
                this.highlightSkill(skillName);
            }
        }
    }

    handleKeyboard(event) {
        switch(event.key) {
            case '1':
                this.setAnimationMode('orbit');
                break;
            case '2':
                this.setAnimationMode('float');
                break;
            case '3':
                this.setAnimationMode('spiral');
                break;
            case 'r':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.restart();
                }
                break;
            case 'f':
                this.toggleFullscreen();
                break;
        }
    }

    handleResize() {
        if (this.renderMode === 'pure-rust') {
            const canvas = document.getElementById('skills-canvas');
            if (canvas) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }
        }
    }

    showSkillInfo(skillName) {
        const skill = this.skillsData.find(s => s.name === skillName);
        if (!skill) return;

        const infoPanel = document.getElementById('skill-info');
        const skillNameEl = document.getElementById('skill-name');
        const skillDescEl = document.getElementById('skill-description');
        
        if (infoPanel && skillNameEl && skillDescEl) {
            skillNameEl.textContent = skill.name;
            skillDescEl.innerHTML = `
                <strong>Proficiency:</strong> ${skill.level}%<br>
                <strong>Category:</strong> ${skill.category}<br>
                <strong>Mode:</strong> Pure Rust Rendering
            `;
            
            infoPanel.style.opacity = '1';
            infoPanel.style.transform = 'translateY(0)';
        }
    }

    hideSkillInfo() {
        const infoPanel = document.getElementById('skill-info');
        if (infoPanel) {
            infoPanel.style.opacity = '0';
            infoPanel.style.transform = 'translateY(20px)';
        }
    }

    highlightSkill(skillName) {
        console.log(`Highlighting skill: ${skillName}`);
        // Add visual feedback for skill selection
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
        if (this.renderMode === 'pure-rust' && this.pureRenderer) {
            this.pureRenderer.update(deltaTime);
        } else if (this.renderMode === 'hybrid' && this.wasmApp) {
            this.wasmApp.update_skills(deltaTime);
        }
    }

    render() {
        if (this.renderMode === 'pure-rust' && this.pureRenderer) {
            this.pureRenderer.render_to_canvas();
        }
        // Hybrid mode rendering is handled by Three.js
    }

    toggleFullscreen() {
        const canvas = document.getElementById('skills-canvas');
        if (canvas) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                canvas.requestFullscreen();
            }
        }
    }

    async restart() {
        console.log('Restarting Rust Frontend...');
        this.destroy();
        await this.init(this.renderMode);
    }

    switchMode(newMode) {
        if (newMode !== this.renderMode) {
            console.log(`Switching from ${this.renderMode} to ${newMode} mode...`);
            this.destroy();
            this.init(newMode);
        }
    }

    // Performance monitoring
    getPerformanceStats() {
        const stats = {
            renderMode: this.renderMode,
            isInitialized: this.isInitialized,
            skillsCount: this.skillsData.length,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : 'Not available'
        };
        
        return stats;
    }

    // Export functionality
    exportSkillsData() {
        const dataStr = JSON.stringify(this.skillsData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skills-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    fallbackToJavaScript() {
        console.warn('WASM initialization failed, falling back to JavaScript implementation');
        
        const script = document.createElement('script');
        script.src = '/static/js/skillsVisualization.js';
        script.onload = () => {
            console.log('Fallback JavaScript visualization loaded');
        };
        document.head.appendChild(script);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.wasmApp = null;
        this.pureRenderer = null;
        this.isInitialized = false;
        
        console.log('Rust Frontend Controller destroyed');
    }
}

// Global initialization
window.initRustFrontend = async (mode = 'hybrid') => {
    if (!window.rustFrontend) {
        window.rustFrontend = new RustFrontendController();
    }
    
    await window.rustFrontend.init(mode);
    
    // Add keyboard shortcuts info
    console.log('Rust Frontend Keyboard Shortcuts:');
    console.log('1, 2, 3: Switch animation modes');
    console.log('F: Toggle fullscreen');
    console.log('Ctrl+R: Restart frontend');
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check if skills canvas exists
    const skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) {
        console.log('Skills canvas not found, skipping Rust frontend');
        return;
    }
    
    // Determine render mode from URL parameters or default
    const urlParams = new URLSearchParams(window.location.search);
    const renderMode = urlParams.get('render') || 'hybrid';
    
    console.log(`Initializing Rust Frontend in ${renderMode} mode...`);
    await window.initRustFrontend(renderMode);
});

export { RustFrontendController };