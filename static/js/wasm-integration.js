// WASM + Three.js Integration for Skills Visualization
// This replaces the problematic skillsVisualization.js with WASM-powered calculations

import init, { WasmApp } from '../wasm/wasm_frontend.js';

class WASMSkillsVisualization {
    constructor() {
        this.wasmApp = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.skillMeshes = [];
        this.canvas = null;
        this.isInitialized = false;
        this.animationId = null;
        this.lastTime = 0;
        
        // Skills data - this matches our CV data
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
        console.log('Initializing WASM Skills Visualization...');
        
        try {
            // Initialize WASM module
            await init();
            this.wasmApp = new WasmApp();
            
            // Initialize with skills data
            await this.wasmApp.init(JSON.stringify(this.skillsData));
            
            // Setup Three.js scene
            this.setupThreeJS();
            
            // Create skill meshes
            this.createSkillMeshes();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.animate();
            
            this.isInitialized = true;
            console.log('WASM Skills Visualization initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize WASM Skills Visualization:', error);
            this.fallbackToJS();
        }
    }

    setupThreeJS() {
        // Get canvas
        this.canvas = document.getElementById('skills-canvas');
        if (!this.canvas) {
            console.error('Skills canvas not found!');
            return;
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);

        // Camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 15);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Atmospheric lighting
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.5, 50);
        pointLight1.position.set(-10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 50);
        pointLight2.position.set(10, -10, 10);
        this.scene.add(pointLight2);
    }

    createSkillMeshes() {
        this.skillsData.forEach((skill, index) => {
            // Create geometry based on skill level
            const radius = 0.8 + (skill.level / 100) * 0.4;
            const geometry = new THREE.SphereGeometry(radius, 32, 32);

            // Create material with skill category color
            const material = new THREE.MeshPhongMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });

            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { skill, index };

            // Initial position
            mesh.position.set(0, 0, 0);

            this.scene.add(mesh);
            this.skillMeshes.push(mesh);

            // Create text sprite
            const sprite = this.createTextSprite(skill.name, skill.category);
            mesh.add(sprite);
        });
    }

    createTextSprite(skillName, category) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // High resolution canvas
        canvas.width = 512;
        canvas.height = 256;
        
        // Clear canvas
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Text styling
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw skill name
        context.fillText(skillName, canvas.width / 2, canvas.height / 2 - 20);
        
        // Draw category
        context.font = '24px Arial, sans-serif';
        context.fillStyle = '#cccccc';
        context.fillText(category, canvas.width / 2, canvas.height / 2 + 20);
        
        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 2, 1);
        sprite.position.set(0, 0, 0);
        
        return sprite;
    }

    setupEventListeners() {
        // Animation mode controls
        const controlButtons = document.querySelectorAll('.skills-control-btn');
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                controlButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Set animation mode in WASM
                const mode = button.dataset.mode;
                this.wasmApp.set_skills_animation_mode(mode);
                
                console.log(`Animation mode changed to: ${mode}`);
            });
        });

        // Mouse hover for info panel
        let mouse = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.skillMeshes);
            
            if (intersects.length > 0) {
                const skill = intersects[0].object.userData.skill;
                this.updateInfoPanel(skill);
                
                // Scale effect
                intersects[0].object.scale.setScalar(1.2);
                intersects[0].object.material.opacity = 1.0;
            } else {
                this.hideInfoPanel();
                
                // Reset all scales
                this.skillMeshes.forEach(mesh => {
                    mesh.scale.setScalar(1.0);
                    mesh.material.opacity = 0.8;
                });
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    updateInfoPanel(skill) {
        const infoPanel = document.getElementById('skill-info');
        const skillName = document.getElementById('skill-name');
        const skillDescription = document.getElementById('skill-description');
        
        if (infoPanel && skillName && skillDescription) {
            skillName.textContent = skill.name;
            skillDescription.innerHTML = `
                <strong>Proficiency:</strong> ${skill.level}%<br>
                <strong>Category:</strong> ${skill.category}<br>
                <strong>Experience:</strong> Professional level
            `;
            
            infoPanel.style.opacity = '1';
            infoPanel.style.transform = 'translateY(0)';
        }
    }

    hideInfoPanel() {
        const infoPanel = document.getElementById('skill-info');
        if (infoPanel) {
            infoPanel.style.opacity = '0';
            infoPanel.style.transform = 'translateY(20px)';
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.wasmApp && this.wasmApp.is_ready()) {
            // Get updated positions from WASM
            const positions = this.wasmApp.update_skills(deltaTime);
            
            // Update Three.js mesh positions
            for (let i = 0; i < Math.min(positions.length, this.skillMeshes.length); i++) {
                const position = positions[i];
                const mesh = this.skillMeshes[i];
                
                if (position && mesh) {
                    mesh.position.set(position[0], position[1], position[2]);
                    
                    // Continuous rotation
                    mesh.rotation.x += 0.01;
                    mesh.rotation.y += 0.02;
                }
            }
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    fallbackToJS() {
        console.warn('WASM initialization failed, falling back to JavaScript implementation');
        
        // Load the original skillsVisualization.js as fallback
        const script = document.createElement('script');
        script.src = '/static/js/skillsVisualization.js';
        script.onload = () => {
            console.log('Fallback JavaScript skills visualization loaded');
        };
        document.head.appendChild(script);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up Three.js objects
        this.skillMeshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        
        console.log('WASM Skills Visualization destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        return;
    }
    
    // Check if skills canvas exists
    const skillsCanvas = document.getElementById('skills-canvas');
    if (!skillsCanvas) {
        console.log('Skills canvas not found, skipping visualization');
        return;
    }
    
    // Initialize WASM Skills Visualization
    window.wasmSkillsViz = new WASMSkillsVisualization();
    await window.wasmSkillsViz.init();
});

export { WASMSkillsVisualization };