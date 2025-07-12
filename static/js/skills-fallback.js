// Pure JavaScript Skills Visualization - Fallback when WASM fails
class SkillsFallback {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.skills = [
            { name: 'ML', x: 0, y: 0, color: '#f59e0b', description: 'Machine Learning expertise with TensorFlow and more' },
            { name: 'PHP', x: 0, y: 0, color: '#777BB4', description: 'Backend development with 10+ years experience' },
            { name: 'Laravel', x: 0, y: 0, color: '#FF2D20', description: 'Full-stack Laravel development since 2016' },
            { name: 'JavaScript', x: 0, y: 0, color: '#F7DF1E', description: 'Frontend and Node.js development' },
            { name: 'Rust', x: 0, y: 0, color: '#CE422B', description: 'Systems programming and WebAssembly' },
            { name: 'Vue.js', x: 0, y: 0, color: '#4FC08D', description: 'Modern reactive frontend frameworks' },
            { name: 'Python', x: 0, y: 0, color: '#3776AB', description: 'Data science and backend automation' },
            { name: 'MySQL', x: 0, y: 0, color: '#4479A1', description: 'Database design and optimization' },
            { name: 'Docker', x: 0, y: 0, color: '#2496ED', description: 'Containerization and DevOps' },
            { name: 'AWS', x: 0, y: 0, color: '#FF9900', description: 'Cloud infrastructure and services' },
            { name: 'Kubernetes', x: 0, y: 0, color: '#326CE5', description: 'Container orchestration' },
            { name: 'Redis', x: 0, y: 0, color: '#DC382D', description: 'Caching and session management' }
        ];
        this.connections = [
            ['PHP', 'Laravel'], ['Laravel', 'MySQL'], ['JavaScript', 'Vue.js'], 
            ['Python', 'AWS'], ['Docker', 'Kubernetes'],
            ['MySQL', 'Redis'], ['AWS', 'Docker'], ['Rust', 'JavaScript'],
            ['PHP', 'JavaScript'], ['Python', 'Docker']
        ];
        this.hoveredSkill = null;
        this.animationTime = 0;
        this.animationFrame = null;
    }

    init() {
        this.canvas = document.getElementById('skills-canvas');
        if (!this.canvas) return false;

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.positionSkills();
        this.setupEventListeners();
        this.startAnimation();
        return true;
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * devicePixelRatio;
        this.canvas.height = rect.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Update canvas style size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    positionSkills() {
        const centerX = this.canvas.clientWidth / 2;
        const centerY = this.canvas.clientHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        // Central ML skill
        this.skills[0].baseX = centerX;
        this.skills[0].baseY = centerY;
        this.skills[0].x = centerX;
        this.skills[0].y = centerY;

        // Orbiting skills
        for (let i = 1; i < this.skills.length; i++) {
            const angle = ((i - 1) / (this.skills.length - 1)) * Math.PI * 2;
            this.skills[i].baseX = centerX + Math.cos(angle) * radius;
            this.skills[i].baseY = centerY + Math.sin(angle) * radius;
            this.skills[i].x = this.skills[i].baseX;
            this.skills[i].y = this.skills[i].baseY;
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.hoveredSkill = null;
            this.skills.forEach((skill, index) => {
                const dx = mouseX - skill.x;
                const dy = mouseY - skill.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) {
                    this.hoveredSkill = index;
                    this.canvas.style.cursor = 'pointer';
                    this.showTooltip(skill, e.clientX, e.clientY);
                    return;
                }
            });
            
            if (this.hoveredSkill === null) {
                this.canvas.style.cursor = 'default';
                this.hideTooltip();
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredSkill = null;
            this.canvas.style.cursor = 'default';
            this.hideTooltip();
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.positionSkills();
        });
    }

    showTooltip(skill, x, y) {
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

    hideTooltip() {
        const tooltip = document.getElementById('skills-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    startAnimation() {
        const animate = (time) => {
            this.animationTime = time / 1000;
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate(0);
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // Set background to match section color
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // Update skill positions with gentle floating animation
        this.skills.forEach((skill, index) => {
            const time = this.animationTime + index * 0.5;
            skill.x = skill.baseX + Math.sin(time * 0.8) * (skill.name === 'ML' ? 4 : 8);
            skill.y = skill.baseY + Math.cos(time * 0.6) * (skill.name === 'ML' ? 3 : 6);
        });

        // Draw connections
        this.connections.forEach(([from, to]) => {
            const skillFrom = this.skills.find(s => s.name === from);
            const skillTo = this.skills.find(s => s.name === to);
            
            if (skillFrom && skillTo) {
                const isHighlighted = this.hoveredSkill !== null && 
                    (this.skills[this.hoveredSkill].name === from || this.skills[this.hoveredSkill].name === to);
                
                ctx.beginPath();
                ctx.moveTo(skillFrom.x, skillFrom.y);
                ctx.lineTo(skillTo.x, skillTo.y);
                ctx.strokeStyle = isHighlighted ? '#6366f1' : 'rgba(99, 102, 241, 0.2)';
                ctx.lineWidth = isHighlighted ? 3 : 1;
                ctx.stroke();
            }
        });

        // Draw skills
        this.skills.forEach((skill, index) => {
            const isHovered = this.hoveredSkill === index;
            const isCentral = skill.name === 'ML';
            const baseRadius = isCentral ? 45 : 30;
            const radius = isHovered ? baseRadius * 1.2 : baseRadius;
            
            // Skill circle with glow effect
            ctx.beginPath();
            ctx.arc(skill.x, skill.y, radius, 0, Math.PI * 2);
            
            if (isHovered) {
                ctx.shadowColor = skill.color;
                ctx.shadowBlur = 20;
            }
            
            ctx.fillStyle = skill.color;
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Skill text
            ctx.fillStyle = (skill.color === '#F7DF1E' || skill.color === '#f59e0b') ? '#000' : '#fff';
            const fontSize = isHovered ? (isCentral ? 16 : 12) : (isCentral ? 14 : 11);
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill.name, skill.x, skill.y);
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.hideTooltip();
    }
}

// Initialize fallback if WASM fails
window.skillsFallback = new SkillsFallback();