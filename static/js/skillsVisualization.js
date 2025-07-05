// Three.js Impressive Skills Network Visualization
// Three.js is loaded via CDN in the HTML template

class SkillsVisualization {
    constructor() {
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.skillNodes = [];
        this.connections = [];
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.time = 0;
        this.hoveredNode = null;
        
        // Define skills with relationships
        this.skillsData = [
            { 
                name: 'PHP', 
                category: 'Backend', 
                color: '#8B5CF6',
                position: { x: -8, y: 4, z: 2 },
                connections: ['Laravel', 'MySQL', 'JavaScript']
            },
            { 
                name: 'Laravel', 
                category: 'Backend', 
                color: '#EF4444',
                position: { x: -4, y: 6, z: -2 },
                connections: ['PHP', 'Vue.js', 'MySQL']
            },
            { 
                name: 'JavaScript', 
                category: 'Frontend', 
                color: '#F59E0B',
                position: { x: 6, y: 3, z: 4 },
                connections: ['Vue.js', 'Node.js', 'PHP']
            },
            { 
                name: 'Vue.js', 
                category: 'Frontend', 
                color: '#10B981',
                position: { x: 8, y: -2, z: 1 },
                connections: ['JavaScript', 'Laravel', 'Node.js']
            },
            { 
                name: 'Python', 
                category: 'Backend', 
                color: '#3B82F6',
                position: { x: -6, y: -4, z: -3 },
                connections: ['TensorFlow', 'AWS', 'Docker']
            },
            { 
                name: 'Node.js', 
                category: 'Backend', 
                color: '#22C55E',
                position: { x: 4, y: -5, z: 2 },
                connections: ['JavaScript', 'Vue.js', 'Docker']
            },
            { 
                name: 'MySQL', 
                category: 'Database', 
                color: '#06B6D4',
                position: { x: -2, y: 2, z: -4 },
                connections: ['PHP', 'Laravel', 'AWS']
            },
            { 
                name: 'Docker', 
                category: 'DevOps', 
                color: '#0EA5E9',
                position: { x: 2, y: -1, z: 5 },
                connections: ['Kubernetes', 'AWS', 'Python', 'Node.js']
            },
            { 
                name: 'Kubernetes', 
                category: 'DevOps', 
                color: '#6366F1',
                position: { x: 7, y: 1, z: -3 },
                connections: ['Docker', 'AWS', 'Go']
            },
            { 
                name: 'AWS', 
                category: 'DevOps', 
                color: '#F97316',
                position: { x: -3, y: -3, z: 1 },
                connections: ['Docker', 'Kubernetes', 'Python', 'MySQL']
            },
            { 
                name: 'Go', 
                category: 'Backend', 
                color: '#14B8A6',
                position: { x: 5, y: 5, z: -1 },
                connections: ['Kubernetes', 'Docker']
            },
            { 
                name: 'TensorFlow', 
                category: 'AI/ML', 
                color: '#EC4899',
                position: { x: -7, y: 0, z: 3 },
                connections: ['Python']
            }
        ];
    }
    
    init() {
        this.canvas = document.getElementById('skills-canvas');
        if (!this.canvas) return;
        
        this.setupScene();
        this.createSkillNetwork();
        this.setupEventListeners();
        this.animate();
    }
    
    setupScene() {
        // Scene with dark background for contrast
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Camera with wider field of view
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 20);
        
        // Renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Ambient lighting for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light for depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add atmospheric point lights
        const pointLight1 = new THREE.PointLight(0x667eea, 1, 30);
        pointLight1.position.set(-15, 10, 10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x764ba2, 1, 30);
        pointLight2.position.set(15, -10, 10);
        this.scene.add(pointLight2);
    }
    
    createSkillNetwork() {
        // Create skill nodes
        this.skillsData.forEach((skill, index) => {
            // Create glowing sphere for each skill
            const geometry = new THREE.SphereGeometry(1.5, 32, 32);
            
            // Create glowing material
            const material = new THREE.MeshPhongMaterial({
                color: skill.color,
                emissive: skill.color,
                emissiveIntensity: 0.2,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(skill.position.x, skill.position.y, skill.position.z);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            
            // Create outer glow effect
            const glowGeometry = new THREE.SphereGeometry(2.2, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0.1
            });
            const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
            glowSphere.position.copy(sphere.position);
            
            // Create floating text
            this.createSkillLabel(skill, sphere.position);
            
            // Store skill data
            sphere.userData = {
                skill: skill,
                originalScale: sphere.scale.clone(),
                glowSphere: glowSphere,
                index: index
            };
            
            this.scene.add(sphere);
            this.scene.add(glowSphere);
            this.skillNodes.push(sphere);
        });
        
        // Create connections between related skills
        this.createConnections();
    }
    
    createSkillLabel(skill, position) {
        // Create canvas for text texture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Set background
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Inter, Arial, sans-serif';
        context.textAlign = 'center';
        context.fillText(skill.name, canvas.width / 2, 60);
        
        context.fillStyle = skill.color;
        context.font = '24px Inter, Arial, sans-serif';
        context.fillText(skill.category, canvas.width / 2, 90);
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(8, 2, 1);
        sprite.position.set(position.x, position.y + 3, position.z);
        
        this.scene.add(sprite);
    }
    
    createConnections() {
        this.skillsData.forEach((skill, index) => {
            skill.connections.forEach(connectionName => {
                const targetSkill = this.skillsData.find(s => s.name === connectionName);
                if (!targetSkill) return;
                
                const startPos = new THREE.Vector3(
                    skill.position.x, 
                    skill.position.y, 
                    skill.position.z
                );
                const endPos = new THREE.Vector3(
                    targetSkill.position.x, 
                    targetSkill.position.y, 
                    targetSkill.position.z
                );
                
                // Create curved connection line
                const curve = new THREE.QuadraticBezierCurve3(
                    startPos,
                    new THREE.Vector3(
                        (startPos.x + endPos.x) / 2 + (Math.random() - 0.5) * 4,
                        (startPos.y + endPos.y) / 2 + (Math.random() - 0.5) * 4,
                        (startPos.z + endPos.z) / 2 + (Math.random() - 0.5) * 4
                    ),
                    endPos
                );
                
                const points = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x667eea,
                    transparent: true,
                    opacity: 0.4,
                    linewidth: 2
                });
                
                const line = new THREE.Line(geometry, material);
                line.userData = { 
                    startIndex: index,
                    targetName: connectionName,
                    originalOpacity: 0.4
                };
                
                this.scene.add(line);
                this.connections.push(line);
            });
        });
    }
    
    setupEventListeners() {
        // Mouse movement for raycasting
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        });
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Remove old control buttons since we only have one mode now
        const controlButtons = document.querySelectorAll('.skills-control-btn');
        controlButtons.forEach(button => button.style.display = 'none');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        
        // Smooth camera rotation
        this.camera.position.x = Math.cos(this.time * 0.1) * 25;
        this.camera.position.z = Math.sin(this.time * 0.1) * 25;
        this.camera.lookAt(0, 0, 0);
        
        // Raycasting for hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.skillNodes);
        
        // Reset all nodes
        this.skillNodes.forEach(node => {
            node.scale.copy(node.userData.originalScale);
            node.material.emissiveIntensity = 0.2;
            node.userData.glowSphere.material.opacity = 0.1;
        });
        
        // Reset all connections
        this.connections.forEach(connection => {
            connection.material.opacity = connection.userData.originalOpacity;
        });
        
        // Handle hover effects
        if (intersects.length > 0) {
            const hoveredNode = intersects[0].object;
            this.hoveredNode = hoveredNode;
            
            // Scale up hovered node
            hoveredNode.scale.setScalar(1.5);
            hoveredNode.material.emissiveIntensity = 0.6;
            hoveredNode.userData.glowSphere.material.opacity = 0.3;
            
            // Highlight connected lines
            const skill = hoveredNode.userData.skill;
            this.connections.forEach(connection => {
                if (connection.userData.startIndex === hoveredNode.userData.index ||
                    skill.connections.includes(connection.userData.targetName)) {
                    connection.material.opacity = 1.0;
                    connection.material.color.setHex(0xffffff);
                } else {
                    connection.material.opacity = 0.1;
                }
            });
            
            // Update info panel
            this.updateInfoPanel(skill);
        } else {
            this.hoveredNode = null;
            this.hideInfoPanel();
            
            // Reset connection colors
            this.connections.forEach(connection => {
                connection.material.color.setHex(0x667eea);
            });
        }
        
        // Animate skill nodes with subtle floating
        this.skillNodes.forEach((node, index) => {
            const floatOffset = Math.sin(this.time * 1.5 + index) * 0.3;
            node.position.y += floatOffset * 0.02;
            
            // Subtle rotation
            node.rotation.x += 0.005;
            node.rotation.y += 0.008;
            
            // Glow sphere follows main sphere
            node.userData.glowSphere.position.copy(node.position);
        });
        
        // Animate connections with flowing effect
        this.connections.forEach((connection, index) => {
            const phase = this.time * 2 + index * 0.5;
            const intensity = (Math.sin(phase) + 1) * 0.5;
            connection.material.opacity = connection.userData.originalOpacity + intensity * 0.3;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateInfoPanel(skill) {
        const infoPanel = document.getElementById('skill-info');
        const skillName = document.getElementById('skill-name');
        const skillDescription = document.getElementById('skill-description');
        
        if (skillName && skillDescription) {
            skillName.textContent = skill.name;
            skillDescription.textContent = `${skill.category} • Connected to: ${skill.connections.join(', ')}`;
            infoPanel.classList.add('visible');
        }
    }
    
    hideInfoPanel() {
        const infoPanel = document.getElementById('skill-info');
        if (infoPanel) {
            infoPanel.classList.remove('visible');
        }
    }
    
    onWindowResize() {
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
        
        // Clean up geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            const skillsViz = new SkillsVisualization();
            skillsViz.init();
        } else {
            console.warn('Three.js not loaded, skills visualization disabled');
        }
    }, 1000);
});