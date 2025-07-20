// Clean Skills Visualization - Working Version
class CleanSkills {
    constructor() {
        this.renderer = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
    }

    async init() {
        console.log('🎨 Initializing Clean Skills Visualization...');
        
        try {
            // Try to load WASM first
            console.log('Attempting to load WASM skills visualization...');
            
            // Import WASM module
            const wasmModule = await import('/static/wasm/wasm_frontend.js');
            await wasmModule.default();
            
            // Create WASM renderer instance
            this.renderer = new wasmModule.CleanSkillsRenderer();
            
            if (this.renderer && this.renderer.init()) {
                console.log('✅ WASM loaded successfully');
                this.isInitialized = true;
                this.setupEventListeners();
                this.startAnimation();
                return;
            } else {
                throw new Error('WASM renderer failed to initialize');
            }
            
        } catch (error) {
            console.log('ℹ️  WASM not available, using JavaScript fallback...');
            
            // Load JavaScript fallback
            this.loadJavaScriptFallback();
        }
    }

    loadJavaScriptFallback() {
        console.log('📦 Loading JavaScript skills visualization...');
        
        // Create a simple fallback visualization
        const canvas = document.getElementById('skills-canvas');
        if (!canvas) {
            console.error('Skills canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Skills data
        const skills = [
            { name: 'Rust', x: 100, y: 100, level: 95, color: '#CE422B' },
            { name: 'JavaScript', x: 300, y: 150, level: 90, color: '#F7DF1E' },
            { name: 'Python', x: 500, y: 120, level: 88, color: '#3776AB' },
            { name: 'PHP', x: 200, y: 250, level: 92, color: '#777BB4' },
            { name: 'Laravel', x: 400, y: 280, level: 90, color: '#FF2D20' },
            { name: 'Vue.js', x: 150, y: 350, level: 85, color: '#4FC08D' },
            { name: 'Docker', x: 350, y: 380, level: 88, color: '#2496ED' },
            { name: 'AWS', x: 250, y: 180, level: 87, color: '#FF9900' }
        ];

        // Animation loop
        let animationFrame = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw skills as animated circles
            skills.forEach((skill, index) => {
                const time = animationFrame * 0.01;
                const radius = 20 + Math.sin(time + index) * 5;
                const alpha = 0.7 + Math.sin(time * 2 + index) * 0.3;
                
                // Draw circle
                ctx.beginPath();
                ctx.arc(skill.x, skill.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = skill.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
                
                // Draw skill name
                ctx.fillStyle = '#333';
                ctx.font = '14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(skill.name, skill.x, skill.y + radius + 20);
                
                // Draw level
                ctx.font = '12px Inter, sans-serif';
                ctx.fillStyle = '#666';
                ctx.fillText(`${skill.level}%`, skill.x, skill.y + radius + 35);
            });
            
            animationFrame++;
            requestAnimationFrame(animate);
        };
        
        animate();
        console.log('✅ JavaScript skills visualization loaded');
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Add any event listeners here
        const canvas = document.getElementById('skills-canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                console.log('Skills canvas clicked');
            });
        }
    }

    startAnimation() {
        if (this.isInitialized && this.renderer) {
            // Start WASM animation
            this.animate();
        }
    }

    animate() {
        if (this.renderer && this.isInitialized) {
            this.renderer.render();
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.isInitialized = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const skillsViz = new CleanSkills();
    skillsViz.init();
});

export default CleanSkills;