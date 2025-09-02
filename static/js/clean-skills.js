// Clean Skills Visualization - WASM + JavaScript Fallback
// Try WASM first, fallback to JavaScript if it fails

class CleanSkills {
    constructor() {
        this.renderer = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
        this.wasmApp = null;
        this.canvas = null;
        this.ctx = null;
        this.mode = 'unknown'; // 'wasm', 'js-fallback', or 'static-fallback'
    }

    async init() {
        // Initializing Clean Skills Visualization
        
        try {
            // Try to load WASM first
            const wasmModule = await import('/static/wasm/wasm_frontend.js');
            await wasmModule.default();
            
            // Create WASM app with skills data
            const skillsData = JSON.stringify([
                { name: 'ML', level: 85, category: 'AI/ML', color: '#f59e0b' },
                { name: 'PHP', level: 95, category: 'Backend', color: '#777BB4' },
                { name: 'Laravel', level: 93, category: 'Backend', color: '#FF2D20' },
                { name: 'JavaScript', level: 92, category: 'Frontend', color: '#F7DF1E' },
                { name: 'Go', level: 85, category: 'Backend', color: '#00ADD8' },
                { name: 'Vue.js', level: 88, category: 'Frontend', color: '#4FC08D' },
                { name: 'Python', level: 90, category: 'Backend', color: '#3776AB' },
                { name: 'MySQL', level: 90, category: 'Database', color: '#4479A1' },
                { name: 'Docker', level: 85, category: 'DevOps', color: '#2496ED' },
                { name: 'AWS', level: 82, category: 'DevOps', color: '#FF9900' },
                { name: 'Kubernetes', level: 78, category: 'DevOps', color: '#326CE5' },
                { name: 'Redis', level: 85, category: 'Database', color: '#DC382D' }
            ]);
            
            this.wasmApp = new wasmModule.WasmApp();
            await this.wasmApp.init(skillsData);
            
            // Initialize WASM canvas rendering
            this.setupWasmCanvas();
            this.mode = 'wasm';
            this.isInitialized = true;
            
            // WASM skills visualization initialized successfully
            
        } catch (error) {
            // WASM failed, trying JavaScript fallback
            this.tryJavaScriptFallback();
        }
    }

    setupWasmCanvas() {
        this.canvas = document.getElementById('skills-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvasSize();
        this.setupWasmEventListeners();
        this.startWasmAnimation();
    }

    setupCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    startWasmAnimation() {
        let lastTime = 0;
        
        const animate = (currentTime) => {
            this.animationId = requestAnimationFrame(animate);
            
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            if (this.wasmApp && this.ctx) {
                this.renderWasmFrame(deltaTime);
            }
        };
        
        animate(0);
    }

    renderWasmFrame(deltaTime) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Set background to match section color
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Update animation time
        this.animationTime = (this.animationTime || 0) + deltaTime;
        
        // Update skill positions with exact same logic as JS fallback
        this.updateSkillPositions();
        
        // Draw connections first (behind skills)
        this.drawConnections();
        
        // Draw skills
        this.drawSkills();
    }

    updateSkillPositions() {
        const centerX = this.canvas.clientWidth / 2;
        const centerY = this.canvas.clientHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        // Initialize skills array if not exists
        if (!this.wasmSkills) {
            // Get skills from WASM with modified names
            if (this.wasmApp) {
                const wasmSkillsArray = this.wasmApp.get_all_skills_data();
                this.wasmSkills = [];
                for (let i = 0; i < wasmSkillsArray.length; i++) {
                    const skillData = wasmSkillsArray[i];
                    this.wasmSkills.push({
                        name: skillData.name,
                        x: 0, y: 0, baseX: 0, baseY: 0,
                        color: skillData.color,
                        description: this.getSkillDescription(skillData.name)
                    });
                }
            } else {
                // Fallback if WASM not available
                this.wasmSkills = [
                    { name: 'ML', x: 0, y: 0, baseX: 0, baseY: 0, color: '#f59e0b', description: 'Machine Learning expertise with TensorFlow and more' },
                    { name: 'PHP', x: 0, y: 0, baseX: 0, baseY: 0, color: '#777BB4', description: 'Backend development with 10+ years experience' },
                    { name: 'Laravel', x: 0, y: 0, baseX: 0, baseY: 0, color: '#FF2D20', description: 'Full-stack Laravel development since 2016' },
                    { name: 'JavaScript', x: 0, y: 0, baseX: 0, baseY: 0, color: '#F7DF1E', description: 'Frontend and Node.js development' },
                    { name: 'Rust', x: 0, y: 0, baseX: 0, baseY: 0, color: '#CE422B', description: 'Systems programming and WebAssembly' },
                    { name: 'Vue.js', x: 0, y: 0, baseX: 0, baseY: 0, color: '#4FC08D', description: 'Modern reactive frontend frameworks' },
                    { name: 'Python', x: 0, y: 0, baseX: 0, baseY: 0, color: '#3776AB', description: 'Data science and backend automation' },
                    { name: 'MySQL', x: 0, y: 0, baseX: 0, baseY: 0, color: '#4479A1', description: 'Database design and optimization' },
                    { name: 'Docker', x: 0, y: 0, baseX: 0, baseY: 0, color: '#2496ED', description: 'Containerization and DevOps' },
                    { name: 'AWS', x: 0, y: 0, baseX: 0, baseY: 0, color: '#FF9900', description: 'Cloud infrastructure and services' },
                    { name: 'Kubernetes', x: 0, y: 0, baseX: 0, baseY: 0, color: '#326CE5', description: 'Container orchestration' },
                    { name: 'Redis', x: 0, y: 0, baseX: 0, baseY: 0, color: '#DC382D', description: 'Caching and session management' }
                ];
            }

            this.wasmConnections = [
                ['PHP', 'Laravel'], ['Laravel', 'MySQL'], ['JavaScript', 'Vue.js'], 
                ['Python', 'AWS'], ['Docker', 'Kubernetes'],
                ['MySQL', 'Redis'], ['AWS', 'Docker'], ['Rust', 'JavaScript'],
                ['PHP', 'JavaScript'], ['Python', 'Docker']
            ];

            this.hoveredSkill = null;

            // Set base positions exactly like JS fallback
            // Central ML skill
            this.wasmSkills[0].baseX = centerX;
            this.wasmSkills[0].baseY = centerY;

            // Orbiting skills
            for (let i = 1; i < this.wasmSkills.length; i++) {
                const angle = ((i - 1) / (this.wasmSkills.length - 1)) * Math.PI * 2;
                this.wasmSkills[i].baseX = centerX + Math.cos(angle) * radius;
                this.wasmSkills[i].baseY = centerY + Math.sin(angle) * radius;
            }
        }

        // Update skill positions with gentle floating animation (exact same as JS)
        this.wasmSkills.forEach((skill, index) => {
            const time = this.animationTime + index * 0.5;
            skill.x = skill.baseX + Math.sin(time * 0.8) * (skill.name === 'ML' ? 4 : 8);
            skill.y = skill.baseY + Math.cos(time * 0.6) * (skill.name === 'ML' ? 3 : 6);
        });
    }

    drawConnections() {
        if (!this.wasmConnections) return;

        this.wasmConnections.forEach(([from, to]) => {
            const skillFrom = this.wasmSkills.find(s => s.name === from);
            const skillTo = this.wasmSkills.find(s => s.name === to);
            
            if (skillFrom && skillTo) {
                const isHighlighted = this.hoveredSkill !== null && 
                    (this.wasmSkills[this.hoveredSkill].name === from || this.wasmSkills[this.hoveredSkill].name === to);
                
                this.ctx.beginPath();
                this.ctx.moveTo(skillFrom.x, skillFrom.y);
                this.ctx.lineTo(skillTo.x, skillTo.y);
                this.ctx.strokeStyle = isHighlighted ? '#6366f1' : 'rgba(99, 102, 241, 0.2)';
                this.ctx.lineWidth = isHighlighted ? 3 : 1;
                this.ctx.stroke();
            }
        });
    }

    drawSkills() {
        if (!this.wasmSkills) return;

        this.wasmSkills.forEach((skill, index) => {
            const isHovered = this.hoveredSkill === index;
            const isCentral = skill.name === 'ML';
            const baseRadius = isCentral ? 45 : 30;
            const radius = isHovered ? baseRadius * 1.2 : baseRadius;
            
            // Skill circle with glow effect
            this.ctx.beginPath();
            this.ctx.arc(skill.x, skill.y, radius, 0, Math.PI * 2);
            
            if (isHovered) {
                this.ctx.shadowColor = skill.color;
                this.ctx.shadowBlur = 20;
            }
            
            this.ctx.fillStyle = skill.color;
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Skill text
            this.ctx.fillStyle = (skill.color === '#F7DF1E' || skill.color === '#f59e0b') ? '#000' : '#fff';
            const fontSize = isHovered ? (isCentral ? 16 : 12) : (isCentral ? 14 : 11);
            this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(skill.name, skill.x, skill.y);
        });
    }

    getSkillDescription(skillName) {
        const descriptions = {
            'ML': 'Machine Learning expertise with TensorFlow and more',
            'PHP': 'Backend development with 10+ years experience',
            'Laravel': 'Full-stack Laravel development since 2016',
            'JavaScript': 'Frontend and Node.js development',
            'Rust': 'Systems programming and WebAssembly',
            'Vue.js': 'Modern reactive frontend frameworks',
            'Python': 'Data science and backend automation',
            'MySQL': 'Database design and optimization',
            'Docker': 'Containerization and DevOps',
            'AWS': 'Cloud infrastructure and services',
            'Kubernetes': 'Container orchestration',
            'Redis': 'Caching and session management'
        };
        return descriptions[skillName] || 'Technology expertise';
    }

    setupWasmEventListeners() {
        if (!this.canvas) return;

        // Mouse movement for hover effects (exact same as JS fallback)
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.hoveredSkill = null;
            if (this.wasmSkills) {
                this.wasmSkills.forEach((skill, index) => {
                    const dx = mouseX - skill.x;
                    const dy = mouseY - skill.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 40) {
                        this.hoveredSkill = index;
                        this.canvas.style.cursor = 'pointer';
                        this.showWasmTooltip(skill, e.clientX, e.clientY);
                        return;
                    }
                });
            }
            
            if (this.hoveredSkill === null) {
                this.canvas.style.cursor = 'default';
                this.hideWasmTooltip();
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredSkill = null;
            this.canvas.style.cursor = 'default';
            this.hideWasmTooltip();
        });

        window.addEventListener('resize', () => {
            this.setupCanvasSize();
            if (this.wasmSkills) {
                // Reset base positions on resize
                this.wasmSkills = null;
            }
        });
    }

    showWasmTooltip(skill, x, y) {
        let tooltip = document.getElementById('skills-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'skills-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                max-width: 300px;
                border: 1px solid ${skill.color};
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <strong style="color: ${skill.color}">${skill.name}</strong><br>
            <small>${skill.description}</small>
        `;
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y - 60) + 'px';
        tooltip.style.display = 'block';
    }

    hideWasmTooltip() {
        const tooltip = document.getElementById('skills-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    tryJavaScriptFallback() {
        // Load and initialize JavaScript fallback
        const script = document.createElement('script');
        script.src = '/static/js/skills-fallback.js';
        script.onload = () => {
            if (window.skillsFallback && window.skillsFallback.init()) {
                // JavaScript fallback loaded successfully
                this.mode = 'js-fallback';
                this.isInitialized = true;
            } else {
                // Fallback failed, showing static fallback
                this.showStaticFallback();
            }
        };
        script.onerror = () => {
            // Could not load fallback, showing static skills
            this.showStaticFallback();
        };
        document.head.appendChild(script);
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
                // Silent error handling
            }
        }
    }

    showStaticFallback() {
        this.mode = 'static-fallback';
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
                    <p style="color: #64748b; margin-bottom: 20px;">WASM and JavaScript visualization unavailable - showing static skills</p>
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

    getMode() {
        return this.mode;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clean up WASM tooltips
        if (this.mode === 'wasm') {
            this.hideWasmTooltip();
        }

        // Clean up JS fallback
        if (this.mode === 'js-fallback' && window.skillsFallback) {
            window.skillsFallback.destroy();
        }

        this.renderer = null;
        this.wasmApp = null;
        this.wasmSkills = null;
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