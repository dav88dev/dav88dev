// Three.js Skills 3D Visualization
// Three.js ES module imports for r150+ compatibility
import * as THREE from 'three';

class SkillsVisualization {
    constructor() {
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.skills = [];
        this.skillObjects = [];
        this.animationMode = 'orbit';
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.time = 0;
        
        this.skillsData = [
            { name: 'PHP', level: 95, category: 'Backend', color: '#6366f1' },
            { name: 'Python', level: 90, category: 'Backend', color: '#6366f1' },
            { name: 'JavaScript', level: 92, category: 'Frontend', color: '#8b5cf6' },
            { name: 'Vue.js', level: 88, category: 'Frontend', color: '#8b5cf6' },
            { name: 'Laravel', level: 93, category: 'Backend', color: '#6366f1' },
            { name: 'MySQL', level: 90, category: 'Database', color: '#06b6d4' },
            { name: 'Docker', level: 85, category: 'DevOps', color: '#10b981' },
            { name: 'AWS', level: 80, category: 'DevOps', color: '#10b981' },
            { name: 'Go', level: 75, category: 'Backend', color: '#6366f1' },
            { name: 'TensorFlow', level: 70, category: 'AI/ML', color: '#f59e0b' },
            { name: 'Kubernetes', level: 78, category: 'DevOps', color: '#10b981' },
            { name: 'Node.js', level: 85, category: 'Backend', color: '#6366f1' }
        ];
    }
    
    init() {
        this.canvas = document.getElementById('skills-canvas');
        if (!this.canvas) return;
        
        this.setupScene();
        this.createSkills();
        this.setupEventListeners();
        this.animate();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8fafc);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
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
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.5, 50);
        pointLight1.position.set(-10, 10, 10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 50);
        pointLight2.position.set(10, -10, 10);
        this.scene.add(pointLight2);
    }
    
    createSkills() {
        this.skillsData.forEach((skill, index) => {
            // Create skill sphere
            const geometry = new THREE.SphereGeometry(0.8 + (skill.level / 100) * 0.4, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            
            // Position spheres in a circle initially
            const angle = (index / this.skillsData.length) * Math.PI * 2;
            const radius = 8;
            sphere.position.x = Math.cos(angle) * radius;
            sphere.position.y = Math.sin(angle) * radius;
            sphere.position.z = (Math.random() - 0.5) * 4;
            
            // Store original position and skill data
            sphere.userData = {
                skill: skill,
                originalPosition: sphere.position.clone(),
                targetPosition: sphere.position.clone(),
                index: index,
                hovered: false
            };
            
            // Create text sprite for skill name
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = skill.color;
            context.font = 'bold 20px Inter, sans-serif';
            context.textAlign = 'center';
            context.fillText(skill.name, canvas.width / 2, 35);
            context.fillStyle = '#666666';
            context.font = '14px Inter, sans-serif';
            context.fillText(skill.category, canvas.width / 2, 50);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(3, 0.75, 1);
            sprite.position.copy(sphere.position);
            sprite.position.y += 1.5;
            
            sphere.userData.sprite = sprite;
            
            this.scene.add(sphere);
            this.scene.add(sprite);
            this.skillObjects.push(sphere);
        });
    }
    
    setupEventListeners() {
        // Mouse movement for raycasting
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        });
        
        // Control buttons
        const controlButtons = document.querySelectorAll('.skills-control-btn');
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                controlButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.animationMode = button.dataset.mode;
                this.updateSkillPositions();
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    updateSkillPositions() {
        this.skillObjects.forEach((sphere, index) => {
            let targetPos = new THREE.Vector3();
            
            switch (this.animationMode) {
                case 'orbit':
                    const angle = (index / this.skillObjects.length) * Math.PI * 2;
                    const radius = 8;
                    targetPos.x = Math.cos(angle) * radius;
                    targetPos.y = Math.sin(angle) * radius;
                    targetPos.z = (Math.random() - 0.5) * 2;
                    break;
                    
                case 'float':
                    targetPos.x = (Math.random() - 0.5) * 16;
                    targetPos.y = (Math.random() - 0.5) * 12;
                    targetPos.z = (Math.random() - 0.5) * 8;
                    break;
                    
                case 'spiral':
                    const spiralAngle = index * 0.8;
                    const spiralRadius = 3 + index * 0.5;
                    targetPos.x = Math.cos(spiralAngle) * spiralRadius;
                    targetPos.y = index * 1.2 - 6;
                    targetPos.z = Math.sin(spiralAngle) * spiralRadius;
                    break;
            }
            
            sphere.userData.targetPosition = targetPos;
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        
        // Raycasting for hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.skillObjects);
        
        // Reset all hovers
        this.skillObjects.forEach(sphere => {
            sphere.userData.hovered = false;
            sphere.scale.setScalar(1);
            sphere.material.opacity = 0.8;
        });
        
        // Handle hover
        if (intersects.length > 0) {
            const hoveredSphere = intersects[0].object;
            hoveredSphere.userData.hovered = true;
            hoveredSphere.scale.setScalar(1.2);
            hoveredSphere.material.opacity = 1.0;
            
            // Update info panel
            this.updateInfoPanel(hoveredSphere.userData.skill);
        } else {
            this.hideInfoPanel();
        }
        
        // Animate skill positions
        this.skillObjects.forEach((sphere, index) => {
            // Smooth movement to target position
            sphere.position.lerp(sphere.userData.targetPosition, 0.02);
            
            // Add floating animation
            const floatOffset = Math.sin(this.time * 2 + index) * 0.2;
            sphere.position.y += floatOffset * 0.1;
            
            // Rotate spheres
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.02;
            
            // Update sprite position
            sphere.userData.sprite.position.copy(sphere.position);
            sphere.userData.sprite.position.y += 1.5;
            
            // Make sprites face camera
            sphere.userData.sprite.lookAt(this.camera.position);
        });
        
        // Camera orbital movement (subtle)
        if (this.animationMode === 'orbit') {
            this.camera.position.x = Math.cos(this.time * 0.1) * 15;
            this.camera.position.z = Math.sin(this.time * 0.1) * 15;
            this.camera.lookAt(0, 0, 0);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateInfoPanel(skill) {
        const infoPanel = document.getElementById('skill-info');
        const skillName = document.getElementById('skill-name');
        const skillDescription = document.getElementById('skill-description');
        
        skillName.textContent = skill.name;
        skillDescription.textContent = `${skill.category} • Proficiency: ${skill.level}% • Click to learn more about this technology`;
        
        infoPanel.classList.add('visible');
    }
    
    hideInfoPanel() {
        const infoPanel = document.getElementById('skill-info');
        infoPanel.classList.remove('visible');
        
        const skillName = document.getElementById('skill-name');
        const skillDescription = document.getElementById('skill-description');
        
        skillName.textContent = 'Hover over a skill to learn more';
        skillDescription.textContent = 'Interactive 3D visualization of technical expertise. Use controls to change the animation mode.';
    }
    
    onWindowResize() {
        if (!this.canvas) return;
        
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.skillObjects.forEach(sphere => {
            sphere.geometry.dispose();
            sphere.material.dispose();
            if (sphere.userData.sprite) {
                sphere.userData.sprite.material.dispose();
                sphere.userData.sprite.material.map.dispose();
            }
        });
    }
}

// Initialize when DOM is loaded
let skillsViz = null;

function initSkillsVisualization() {
    if (skillsViz) {
        skillsViz.destroy();
    }
    
    skillsViz = new SkillsVisualization();
    skillsViz.init();
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization to ensure Three.js is loaded
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            initSkillsVisualization();
        } else {
            console.warn('Three.js not loaded, skills visualization disabled');
        }
    }, 1000);
});

// Export for ES module compatibility
export { SkillsVisualization };